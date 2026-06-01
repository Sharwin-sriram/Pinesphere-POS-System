from .models import Transaction, PaymentGateway, Subscription


def create_transaction(restaurant, amount, currency='INR', order=None, gateway=None, metadata=None):
    tx = Transaction.objects.create(
        restaurant=restaurant,
        order=order,
        gateway=gateway,
        amount=amount,
        currency=currency,
        metadata=metadata or {},
    )
    # NOTE: Integration with real gateway is left to specific provider implementations.
    return tx


def mark_transaction_success(tx: Transaction, provider_reference: str = None):
    tx.status = 'SUCCESS'
    if provider_reference:
        tx.provider_reference = provider_reference
    tx.save()
    return tx


def create_subscription(restaurant, plan):
    sub = Subscription.objects.create(restaurant=restaurant, plan=plan)
    return sub


def cancel_subscription(sub: Subscription):
    sub.status = 'CANCELLED'
    sub.ended_at = None
    sub.save()
    return sub


import uuid
import razorpay
from django.conf import settings
from django.db import transaction
from .models import Payment, PaymentStatus, PaymentEvent
from .exceptions import (
    RazorpayOrderCreationError,
    RazorpaySignatureVerificationError,
    RazorpayRefundError,
    PaymentAlreadyProcessedError
)


def get_razorpay_client() -> razorpay.Client:
    """Initialize and return a Razorpay client instance using settings credentials.

    Returns:
        razorpay.Client: The initialized client object.
    """
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_razorpay_order(customer, amount: int, currency: str, receipt: str, notes: dict) -> Payment:
    """Create a Razorpay Order and persist it in the database as PENDING.

    Args:
        customer: User model instance initiating the payment.
        amount: Positive integer in paise.
        currency: 3-letter currency code (e.g., "INR").
        receipt: Receipt identifier for the order.
        notes: Key-value notes dictionary for the order.

    Returns:
        Payment: The created Payment model instance.

    Raises:
        RazorpayOrderCreationError: If the Razorpay API call fails.
    """
    client = get_razorpay_client()
    data = {
        "amount": amount,
        "currency": currency,
        "receipt": receipt,
        "notes": notes,
    }

    try:
        # Call Razorpay SDK to create the order
        razorpay_order = client.order.create(data=data)
    except Exception as e:
        raise RazorpayOrderCreationError(f"Razorpay order creation failed: {str(e)}")

    # Persist the order details to DB under an atomic transaction
    with transaction.atomic():
        payment = Payment.objects.create(
            customer=customer,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            currency=currency,
            status=PaymentStatus.PENDING,
            receipt=receipt,
            notes=notes,
            metadata=razorpay_order,
        )
        # Log order creation event
        PaymentEvent.objects.create(
            payment=payment,
            event="payment.created",
            payload={"razorpay_order": razorpay_order}
        )

    return payment


def verify_razorpay_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> Payment:
    """Verify the Razorpay client-side signature and update status to PAID.

    This function locks the Payment row inside an atomic transaction using select_for_update
    to prevent race conditions and is fully idempotent.

    Args:
        razorpay_order_id: The Razorpay order ID.
        razorpay_payment_id: The Razorpay payment ID.
        razorpay_signature: HMAC-SHA256 signature from client.

    Returns:
        Payment: The verified/updated Payment model instance.

    Raises:
        RazorpaySignatureVerificationError: If signature verification fails.
        PaymentAlreadyProcessedError: If payment was already processed.
    """
    client = get_razorpay_client()
    params = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": razorpay_signature,
    }

    # 1. Perform signature verification
    try:
        client.utility.verify_payment_signature(params)
    except Exception as e:
        # Wrap signature update to FAILED in transaction
        with transaction.atomic():
            payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).select_for_update().first()
            if payment:
                if payment.status == PaymentStatus.PENDING:
                    payment.status = PaymentStatus.FAILED
                    payment.razorpay_payment_id = razorpay_payment_id
                    payment.save()
                    PaymentEvent.objects.create(
                        payment=payment,
                        event="payment.failed",
                        payload={"error": str(e), "razorpay_payment_id": razorpay_payment_id}
                    )
        raise RazorpaySignatureVerificationError(f"Razorpay payment verification failed: {str(e)}")

    # 2. Update status and save
    with transaction.atomic():
        payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).select_for_update().first()
        if not payment:
            raise RazorpaySignatureVerificationError("Order record does not exist in local database.")

        if payment.status == PaymentStatus.PAID:
            # Handle duplicate POSTs gracefully (idempotency check)
            return payment

        if payment.status in [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]:
            raise PaymentAlreadyProcessedError("Payment has already been processed and refunded.")

        payment.status = PaymentStatus.PAID
        payment.razorpay_payment_id = razorpay_payment_id
        payment.save()

        # Log captured payment event
        PaymentEvent.objects.create(
            payment=payment,
            event="payment.captured",
            payload={"razorpay_payment_id": razorpay_payment_id, "razorpay_signature": razorpay_signature}
        )

    return payment


def process_refund(payment_id: str, amount: int = None) -> Payment:
    """Initiate a full or partial refund for a payment via Razorpay.

    Args:
        payment_id: UUID string representing the local Payment object ID.
        amount: Optional refund amount in paise. If None, initiates a full refund.

    Returns:
        Payment: The updated Payment model instance.

    Raises:
        RazorpayRefundError: If the refund parameters are invalid or Razorpay request fails.
    """
    client = get_razorpay_client()

    with transaction.atomic():
        payment = Payment.objects.filter(id=payment_id).select_for_update().first()
        if not payment:
            raise RazorpayRefundError("Payment record not found.")

        if payment.status not in [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED]:
            raise RazorpayRefundError("Only PAID or PARTIALLY_REFUNDED payments can be refunded.")

        if amount is not None:
            if amount <= 0:
                raise RazorpayRefundError("Refund amount must be a positive integer in paise.")
            if amount > payment.amount:
                raise RazorpayRefundError("Refund amount cannot exceed the original payment amount.")

            # Calculate total amount already refunded across past refund events
            refund_events = payment.events.filter(event="payment.refunded")
            total_refunded = sum(e.payload.get("amount", 0) for e in refund_events)
            if total_refunded + amount > payment.amount:
                raise RazorpayRefundError("Total refund amount exceeds original payment amount.")
        else:
            # Fallback to full amount refund
            refund_events = payment.events.filter(event="payment.refunded")
            total_refunded = sum(e.payload.get("amount", 0) for e in refund_events)
            amount = payment.amount - total_refunded
            if amount <= 0:
                raise RazorpayRefundError("Payment is already fully refunded.")

        # Generate idempotency key
        idempotency_key = f"{payment.id}-{uuid.uuid4()}"
        payment.idempotency_key = idempotency_key
        payment.save()

        # Prepare SDK parameters
        refund_data = {
            "payment_id": payment.razorpay_payment_id,
            "amount": amount,
        }

        try:
            # Pass idempotency key in headers of refund.create SDK call
            headers = {"X-Razorpay-Idempotency-Key": idempotency_key}
            razorpay_refund = client.refund.create(data=refund_data, headers=headers)
        except Exception as e:
            raise RazorpayRefundError(f"Razorpay API refund request failed: {str(e)}")

        # Re-fetch events and compute new status
        total_refunded_so_far = total_refunded + amount
        if total_refunded_so_far >= payment.amount:
            payment.status = PaymentStatus.REFUNDED
        else:
            payment.status = PaymentStatus.PARTIALLY_REFUNDED

        payment.save()

        # Log refund event
        PaymentEvent.objects.create(
            payment=payment,
            event="payment.refunded",
            payload={
                "amount": amount,
                "idempotency_key": idempotency_key,
                "razorpay_refund_id": razorpay_refund.get("id"),
                "raw_response": razorpay_refund
            }
        )

    return payment

