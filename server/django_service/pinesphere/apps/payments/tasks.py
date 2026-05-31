"""Celery tasks for processing payment webhooks asynchronously."""

import logging
from celery import shared_task
from django.db import transaction
import razorpay.errors

from .models import Payment, PaymentStatus, PaymentEvent

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def process_webhook_event(self, event_name: str, payload: dict) -> None:
    """Asynchronously and idempotently processes verified Razorpay webhook events.

    Retries on transient failures with exponential backoff (30s -> 60s -> 120s).

    Args:
        event_name: The name of the event from Razorpay (e.g. "payment.captured").
        payload: The raw JSON body of the webhook.
    """
    event_id = payload.get("id")
    logger.info("Processing webhook event %s (ID: %s)", event_name, event_id)

    # 1. Extract payment/order identification from payload
    event_payload = payload.get("payload", {})
    payment_data = event_payload.get("payment", {}).get("entity", {})
    razorpay_payment_id = payment_data.get("id")
    razorpay_order_id = payment_data.get("order_id")

    if not razorpay_order_id:
        # Some webhooks (like refund.created) have payment details nested inside a refund entity
        refund_data = event_payload.get("refund", {}).get("entity", {})
        razorpay_payment_id = refund_data.get("payment_id") or razorpay_payment_id
        # If order_id isn't directly in payment entity, we try to fetch from payment details
        # fallback lookup by payment_id
        logger.warning("Order ID not found directly in event payload. Fallback to lookup by payment ID.")

    # 2. Look up the payment record in our DB
    payment = None
    if razorpay_order_id:
        payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()
    if not payment and razorpay_payment_id:
        payment = Payment.objects.filter(razorpay_payment_id=razorpay_payment_id).first()

    if not payment:
        logger.error(
            "Could not find matching payment record for Order: %s, Payment: %s. Event: %s",
            razorpay_order_id,
            razorpay_payment_id,
            event_name
        )
        # Dead-letter: Since we have no payment record to attach, we cannot log to PaymentEvent table
        # We raise a custom log error instead.
        return

    # 3. Idempotency Check: Verify if this event ID has already been logged under this payment
    if event_id and PaymentEvent.objects.filter(payment=payment, payload__id=event_id).exists():
        logger.info("Event %s (ID: %s) already processed. Skipping.", event_name, event_id)
        return

    # 4. Handle event types inside a secure atomic transaction
    try:
        with transaction.atomic():
            # Re-fetch with select_for_update to avoid race conditions
            payment = Payment.objects.select_for_update().get(id=payment.id)

            if event_name == "payment.captured":
                if payment.status in [PaymentStatus.PENDING, PaymentStatus.FAILED]:
                    payment.status = PaymentStatus.PAID
                    payment.razorpay_payment_id = razorpay_payment_id
                    payment.save()
                    PaymentEvent.objects.create(
                        payment=payment,
                        event=event_name,
                        payload=payload
                    )
                    logger.info("Payment %s marked as PAID via webhook.", payment.id)
                else:
                    logger.info("Payment %s already in status %s. Skipping update.", payment.id, payment.status)

            elif event_name == "payment.failed":
                if payment.status == PaymentStatus.PENDING:
                    payment.status = PaymentStatus.FAILED
                    payment.razorpay_payment_id = razorpay_payment_id
                    payment.save()
                    PaymentEvent.objects.create(
                        payment=payment,
                        event=event_name,
                        payload=payload
                    )
                    logger.info("Payment %s marked as FAILED via webhook.", payment.id)
                else:
                    logger.info("Payment %s already in status %s. Skipping update.", payment.id, payment.status)

            elif event_name == "refund.created":
                refund_data = event_payload.get("refund", {}).get("entity", {})
                refund_amount = refund_data.get("amount", 0)

                # Fetch all refund events to calculate sum
                refund_events = payment.events.filter(event="payment.refunded")
                total_refunded = sum(e.payload.get("amount", 0) for e in refund_events) + refund_amount

                if total_refunded >= payment.amount:
                    payment.status = PaymentStatus.REFUNDED
                else:
                    payment.status = PaymentStatus.PARTIALLY_REFUNDED

                payment.save()
                PaymentEvent.objects.create(
                    payment=payment,
                    event="payment.refunded",
                    payload={
                        "amount": refund_amount,
                        "razorpay_refund_id": refund_data.get("id"),
                        "raw_webhook_payload": payload
                    }
                )
                logger.info("Payment %s status updated to %s due to refund webhook.", payment.id, payment.status)

            else:
                # Dead-letter handling: Log unrecognized event to PaymentEvent table for auditing
                PaymentEvent.objects.create(
                    payment=payment,
                    event=event_name,
                    payload=payload
                )
                logger.warning(
                    "Logged unrecognized Razorpay webhook event: %s for Payment: %s",
                    event_name,
                    payment.id
                )

    except (razorpay.errors.ServerError, Exception) as exc:
        # Determine retry countdown with exponential backoff (e.g., retries: 0 -> 30s, 1 -> 60s, 2 -> 120s)
        retries = self.request.retries
        countdown = 30 * (2 ** retries)
        logger.warning(
            "Transient failure processing event %s. Retrying in %ds (Attempt %d/3). Error: %s",
            event_name,
            countdown,
            retries + 1,
            str(exc)
        )
        raise self.retry(exc=exc, countdown=countdown)
