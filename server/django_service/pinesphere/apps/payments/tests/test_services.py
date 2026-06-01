"""Unit tests for the payments services."""

from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from django.test import TestCase

from pinesphere.apps.payments import services
from pinesphere.apps.payments.exceptions import (
    PaymentAlreadyProcessedError,
    RazorpayOrderCreationError,
    RazorpayRefundError,
    RazorpaySignatureVerificationError,
)
from pinesphere.apps.payments.models import Payment, PaymentEvent, PaymentStatus

User = get_user_model()


class PaymentServicesTestCase(TestCase):
    """Test cases for Payment verification, creation, and refund services."""

    def setUp(self):
        self.user = User.objects.create_user(
            mobile="9876543210",
            email="testcustomer@pinesphere.com",
            first_name="Test",
            last_name="Customer",
            role="CUSTOMER"
        )
        self.mock_client = MagicMock()

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_create_razorpay_order_success(self, mock_get_client):
        """Verify successful Razorpay order creation and local database persistence."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.order.create.return_value = {
            "id": "order_mock123",
            "amount": 50000,
            "currency": "INR",
            "receipt": "receipt_123",
            "notes": {"info": "test"}
        }

        payment = services.create_razorpay_order(
            customer=self.user,
            amount=50000,
            currency="INR",
            receipt="receipt_123",
            notes={"info": "test"}
        )

        self.assertEqual(payment.razorpay_order_id, "order_mock123")
        self.assertEqual(payment.status, PaymentStatus.PENDING)
        self.assertTrue(PaymentEvent.objects.filter(payment=payment, event="payment.created").exists())

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_create_razorpay_order_failure(self, mock_get_client):
        """Verify that Razorpay order creation exception wraps SDK exceptions properly."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.order.create.side_effect = Exception("SDK Connection Timeout")

        with self.assertRaises(RazorpayOrderCreationError):
            services.create_razorpay_order(
                customer=self.user,
                amount=50000,
                currency="INR",
                receipt="receipt_123",
                notes={}
            )

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_verify_payment_success(self, mock_get_client):
        """Verify payment is successfully marked as PAID upon valid signature verification."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.utility.verify_payment_signature.return_value = True

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PENDING
        )

        verified_payment = services.verify_razorpay_payment(
            razorpay_order_id="order_mock123",
            razorpay_payment_id="pay_mock123",
            razorpay_signature="sig_mock123"
        )

        self.assertEqual(verified_payment.status, PaymentStatus.PAID)
        self.assertEqual(verified_payment.razorpay_payment_id, "pay_mock123")
        self.assertTrue(PaymentEvent.objects.filter(payment=payment, event="payment.captured").exists())

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_verify_payment_failure(self, mock_get_client):
        """Verify payment is marked as FAILED if signature verification fails."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.utility.verify_payment_signature.side_effect = Exception("Signature verification failed")

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PENDING
        )

        with self.assertRaises(RazorpaySignatureVerificationError):
            services.verify_razorpay_payment(
                razorpay_order_id="order_mock123",
                razorpay_payment_id="pay_mock123",
                razorpay_signature="sig_mock123"
            )

        payment.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.FAILED)
        self.assertTrue(PaymentEvent.objects.filter(payment=payment, event="payment.failed").exists())

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_verify_payment_idempotency(self, mock_get_client):
        """Verify that multiple signature checks for a PAID order return gracefully (idempotent)."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.utility.verify_payment_signature.return_value = True

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            razorpay_payment_id="pay_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PAID
        )

        verified_payment = services.verify_razorpay_payment(
            razorpay_order_id="order_mock123",
            razorpay_payment_id="pay_mock123",
            razorpay_signature="sig_mock123"
        )
        self.assertEqual(verified_payment.status, PaymentStatus.PAID)

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_process_refund_full_success(self, mock_get_client):
        """Verify initiating a full refund correctly transitions status to REFUNDED."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.refund.create.return_value = {"id": "rfnd_mock123", "amount": 50000}

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            razorpay_payment_id="pay_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PAID
        )

        refunded_payment = services.process_refund(payment_id=payment.id)

        self.assertEqual(refunded_payment.status, PaymentStatus.REFUNDED)
        self.assertIsNotNone(refunded_payment.idempotency_key)
        self.assertTrue(PaymentEvent.objects.filter(payment=payment, event="payment.refunded").exists())

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_process_refund_partial_success(self, mock_get_client):
        """Verify initiating a partial refund correctly transitions status to PARTIALLY_REFUNDED."""
        mock_get_client.return_value = self.mock_client
        self.mock_client.refund.create.return_value = {"id": "rfnd_mock123", "amount": 20000}

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            razorpay_payment_id="pay_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PAID
        )

        refunded_payment = services.process_refund(payment_id=payment.id, amount=20000)

        self.assertEqual(refunded_payment.status, PaymentStatus.PARTIALLY_REFUNDED)
