"""
Payment processing API views
Handles Razorpay payment integration
"""
import os
import hmac
import hashlib
import json
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import razorpay

# Initialize Razorpay client
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None


def _error(code: str, detail: str, status_code: int = 400):
    """Return error response"""
    return Response(
        {
            "success": False,
            "error": {"code": code, "detail": detail},
        },
        status=status_code,
    )


def _success(data=None, status_code: int = 200):
    """Return success response"""
    return Response(
        {
            "success": True,
            "data": data or {},
        },
        status=status_code,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    """
    Create a Razorpay order for payment
    """
    if not razorpay_client:
        return _error(
            "razorpay_not_configured",
            "Razorpay is not configured",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    data = request.data
    
    # Validate required fields
    required_fields = ['amount', 'customer_name', 'customer_email', 'customer_phone']
    for field in required_fields:
        if field not in data:
            return _error(f"missing_{field}", f"{field} is required")

    try:
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to paise
        if amount <= 0:
            return _error("invalid_amount", "Amount must be greater than 0")

        # Create order on Razorpay
        order_data = {
            "amount": amount,
            "currency": data.get('currency', 'INR'),
            "receipt": data.get('receipt', f"order_{request.user.id}_{int(__import__('time').time())}"),
            "notes": {
                "customer_name": data.get('customer_name'),
                "customer_email": data.get('customer_email'),
                "customer_phone": data.get('customer_phone'),
                "order_id": data.get('order_id', ''),
                **data.get('notes', {}),
            },
        }

        razorpay_order = razorpay_client.order.create(data=order_data)

        return _success(razorpay_order, status_code=status.HTTP_201_CREATED)

    except Exception as e:
        return _error("razorpay_error", str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_razorpay_payment(request):
    """
    Verify Razorpay payment signature
    """
    if not razorpay_client:
        return _error(
            "razorpay_not_configured",
            "Razorpay is not configured",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    data = request.data
    
    # Validate required fields
    required_fields = ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature']
    for field in required_fields:
        if field not in data:
            return _error(f"missing_{field}", f"{field} is required")

    try:
        payment_id = data.get('razorpay_payment_id')
        order_id = data.get('razorpay_order_id')
        signature = data.get('razorpay_signature')

        # Verify signature
        message = f"{order_id}|{payment_id}"
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        if signature != expected_signature:
            return _error(
                "invalid_signature",
                "Payment signature verification failed",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch payment details from Razorpay
        payment = razorpay_client.payment.fetch(payment_id)

        return _success({
            "verified": True,
            "message": "Payment verified successfully",
            "payment_id": payment_id,
            "order_id": order_id,
            "amount": payment.get('amount'),
            "status": payment.get('status'),
        })

    except Exception as e:
        return _error("verification_error", str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def capture_razorpay_payment(request):
    """
    Capture a Razorpay payment (for authorized payments)
    """
    if not razorpay_client:
        return _error(
            "razorpay_not_configured",
            "Razorpay is not configured",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    data = request.data
    
    # Validate required fields
    if 'razorpay_payment_id' not in data or 'amount' not in data:
        return _error("missing_fields", "razorpay_payment_id and amount are required")

    try:
        payment_id = data.get('razorpay_payment_id')
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to paise

        # Capture payment
        razorpay_client.payment.capture(payment_id, amount)

        return _success({
            "message": "Payment captured successfully",
            "payment_id": payment_id,
        })

    except Exception as e:
        return _error("capture_error", str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refund_razorpay_payment(request):
    """
    Refund a Razorpay payment
    """
    if not razorpay_client:
        return _error(
            "razorpay_not_configured",
            "Razorpay is not configured",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    data = request.data
    
    # Validate required fields
    if 'razorpay_payment_id' not in data:
        return _error("missing_payment_id", "razorpay_payment_id is required")

    try:
        payment_id = data.get('razorpay_payment_id')
        amount = data.get('amount')  # Optional - if not provided, full refund
        notes = data.get('notes', {})

        refund_data = {
            "notes": notes,
        }
        
        if amount:
            refund_data["amount"] = int(float(amount) * 100)  # Convert to paise

        # Create refund
        refund = razorpay_client.payment.refund(payment_id, refund_data)

        return _success({
            "message": "Refund initiated successfully",
            "refund_id": refund.get('id'),
            "payment_id": payment_id,
            "amount": refund.get('amount'),
            "status": refund.get('status'),
        })

    except Exception as e:
        return _error("refund_error", str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_razorpay_payment(request, payment_id):
    """
    Get details of a Razorpay payment
    """
    if not razorpay_client:
        return _error(
            "razorpay_not_configured",
            "Razorpay is not configured",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        payment = razorpay_client.payment.fetch(payment_id)
        return _success(payment)

    except Exception as e:
        return _error("fetch_error", str(e), status_code=status.HTTP_400_BAD_REQUEST)
