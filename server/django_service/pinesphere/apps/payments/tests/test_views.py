"""Unit tests for the payments API views."""

import hashlib
import hmac
from unittest.mock import MagicMock, patch
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from django.test import override_settings
from pinesphere.apps.payments.models import Payment, PaymentStatus

User = get_user_model()


@override_settings(CACHES={
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
})
class PaymentViewsTestCase(APITestCase):
    """Test cases for Payment creation, verification, webhook, and refund API endpoints."""

    def setUp(self):
        # Create regular user
        self.user = User.objects.create_user(
            mobile="9876543210",
            email="testcustomer@pinesphere.com",
            first_name="Test",
            last_name="Customer",
            role="CUSTOMER"
        )
        # Create admin user
        self.admin_user = User.objects.create_user(
            mobile="9999999999",
            email="admin@pinesphere.com",
            first_name="Admin",
            last_name="User",
            role="SUPER_ADMIN",
            is_staff=True
        )

        self.client = APIClient()

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_create_order_authenticated(self, mock_get_client):
        """Verify authenticated users can create an order successfully."""
        self.client.force_authenticate(user=self.user)

        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.order.create.return_value = {
            "id": "order_mock123",
            "amount": 50000,
            "currency": "INR",
            "receipt": "receipt_123",
            "notes": {"purpose": "test"}
        }

        data = {
            "amount": 50000,
            "currency": "INR",
            "receipt": "receipt_123",
            "notes": {"purpose": "test"}
        }
        response = self.client.post("/api/v1/payments/create-order/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["order_id"], "order_mock123")
        self.assertEqual(response.data["amount"], 50000)
        self.assertEqual(response.data["currency"], "INR")
        self.assertEqual(response.data["key_id"], settings.RAZORPAY_KEY_ID)

    def test_create_order_unauthenticated(self):
        """Verify unauthenticated users are rejected with 401 Unauthorized."""
        data = {
            "amount": 50000,
            "currency": "INR",
            "receipt": "receipt_123"
        }
        response = self.client.post("/api/v1/payments/create-order/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_invalid_amount(self):
        """Verify negative or invalid amount is rejected with 400 Bad Request."""
        self.client.force_authenticate(user=self.user)
        data = {
            "amount": -500,
            "currency": "INR",
            "receipt": "receipt_123"
        }
        response = self.client.post("/api/v1/payments/create-order/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_payment_verification_success(self, mock_get_client):
        """Verify signature verification updates order status to PAID."""
        self.client.force_authenticate(user=self.user)

        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.utility.verify_payment_signature.return_value = True

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PENDING
        )

        data = {
            "razorpay_order_id": "order_mock123",
            "razorpay_payment_id": "pay_mock123",
            "razorpay_signature": "sig_mock123"
        }
        response = self.client.post("/api/v1/payments/verify/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["payment_id"], payment.id)

        payment.refresh_from_db()
        self.assertEqual(payment.status, PaymentStatus.PAID)
        self.assertEqual(payment.razorpay_payment_id, "pay_mock123")

    @patch("pinesphere.apps.payments.tasks.process_webhook_event.delay")
    def test_webhook_authenticated_by_signature(self, mock_celery_task):
        """Verify webhook accepts request and schedules Celery task when webhook signature is valid."""
        payload = b'{"event":"payment.captured"}'
        signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            payload,
            hashlib.sha256
        ).hexdigest()

        # Send post request with headers
        response = self.client.post(
            "/api/v1/payments/webhook/",
            data=payload,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "received")
        mock_celery_task.assert_called_once()

    def test_webhook_invalid_signature_rejected(self):
        """Verify webhook rejects request with 401 Unauthorized when webhook signature is invalid."""
        payload = b'{"event":"payment.captured"}'
        response = self.client.post(
            "/api/v1/payments/webhook/",
            data=payload,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE="invalid_signature_string"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("pinesphere.apps.payments.services.get_razorpay_client")
    def test_refund_by_admin_success(self, mock_get_client):
        """Verify admin user can successfully trigger a refund."""
        self.client.force_authenticate(user=self.admin_user)

        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.refund.create.return_value = {"id": "rfnd_mock123", "amount": 50000}

        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            razorpay_payment_id="pay_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PAID
        )

        data = {
            "payment_id": str(payment.id)
        }
        response = self.client.post("/api/v1/payments/refund/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["status"], PaymentStatus.REFUNDED)

    def test_refund_by_non_admin_forbidden(self):
        """Verify non-admin users cannot call the refund view."""
        self.client.force_authenticate(user=self.user)
        payment = Payment.objects.create(
            customer=self.user,
            razorpay_order_id="order_mock123",
            amount=50000,
            receipt="receipt_123",
            status=PaymentStatus.PAID
        )

        data = {
            "payment_id": str(payment.id)
        }
        response = self.client.post("/api/v1/payments/refund/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
