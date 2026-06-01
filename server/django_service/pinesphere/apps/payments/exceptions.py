"""Custom exceptions for the Razorpay payment integration."""

from rest_framework.exceptions import APIException
from rest_framework import status


class PaymentIntegrationError(APIException):
    """Base exception for all payment integration errors.

    Used to map custom payment exceptions to a consistent DRF response shape.
    """

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A payment integration error occurred."
    default_code = "PAYMENT_ERROR"
    is_payment_exception = True

    def __init__(self, detail=None, code=None, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code
        else:
            self.code = self.default_code
        super().__init__(detail, self.code)


class RazorpayOrderCreationError(PaymentIntegrationError):
    """Exception raised when Razorpay order creation fails."""

    default_detail = "Failed to create Razorpay order."
    default_code = "ORDER_CREATION_FAILED"


class RazorpaySignatureVerificationError(PaymentIntegrationError):
    """Exception raised when signature verification fails."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Signature verification failed."
    default_code = "SIGNATURE_MISMATCH"


class RazorpayRefundError(PaymentIntegrationError):
    """Exception raised when refund request fails."""

    default_detail = "Failed to initiate refund."
    default_code = "REFUND_FAILED"


class PaymentAlreadyProcessedError(PaymentIntegrationError):
    """Exception raised when trying to verify or process a payment that is already PAID."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = "Payment has already been processed."
    default_code = "PAYMENT_ALREADY_PROCESSED"
