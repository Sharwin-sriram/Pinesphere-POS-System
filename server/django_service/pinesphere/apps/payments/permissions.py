"""Custom authentication and permission classes for payments."""

import hashlib
import hmac
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class RazorpayWebhookAuthentication(BaseAuthentication):
    """Custom authentication class for validating Razorpay webhook signatures.

    Validates the X-Razorpay-Signature header against the raw request body
    using the configured RAZORPAY_WEBHOOK_SECRET.
    """

    def authenticate(self, request):
        signature = request.META.get("HTTP_X_RAZORPAY_SIGNATURE")
        if not signature:
            raise AuthenticationFailed("Missing X-Razorpay-Signature header.")

        try:
            # Read raw request body before JSON parsing
            body = request.body
        except Exception as e:
            raise AuthenticationFailed(f"Unable to read request body: {str(e)}")

        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        if not webhook_secret:
            raise AuthenticationFailed("RAZORPAY_WEBHOOK_SECRET settings attribute is not configured.")

        # Calculate the HMAC hex digest using SHA-256
        expected_signature = hmac.new(
            webhook_secret.encode("utf-8"),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            raise AuthenticationFailed("Signature verification failed. Invalid webhook payload signature.")

        # Return AnonymousUser to satisfy DRF authentication interface
        return (AnonymousUser(), None)

    def authenticate_header(self, request):
        """Return the signature challenge header value to enforce 401 Unauthorized."""
        return "Signature"
