"""Unit tests for the payments models."""

from django.contrib.auth import get_user_model
from django.test import TestCase

from pinesphere.apps.payments.models import Payment, PaymentEvent, PaymentStatus

User = get_user_model()


class PaymentModelTestCase(TestCase):
    """Test cases for Payment and PaymentEvent models."""

    def setUp(self):
        self.user = User.objects.create_user(
            mobile="9876543210",
            email="testcustomer@pinesphere.com",
            first_name="Test",
            last_name="Customer",
            role="CUSTOMER"
        )

    def test_payment_creation(self):
        """Verify that a Payment record is created with expected defaults."""
        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_12345",
            amount=50000,  # 500 INR in paise
            receipt="receipt_test_1",
            notes={"purpose": "test"}
        )
        self.assertIsNotNone(payment.id)
        self.assertEqual(payment.status, PaymentStatus.PENDING)
        self.assertEqual(payment.amount, 50000)
        self.assertEqual(payment.currency, "INR")
        self.assertEqual(payment.notes, {"purpose": "test"})
        self.assertEqual(str(payment), f"Payment {payment.id} - PENDING (50000 INR)")

    def test_payment_event_creation(self):
        """Verify that a PaymentEvent record is created successfully and linked to a Payment."""
        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_54321",
            amount=25000,
            receipt="receipt_test_2"
        )
        event = PaymentEvent.objects.create(
            payment=payment,
            event="payment.created",
            payload={"test": "data"}
        )
        self.assertIsNotNone(event.id)
        self.assertEqual(event.payment, payment)
        self.assertEqual(event.event, "payment.created")
        self.assertEqual(event.payload, {"test": "data"})
