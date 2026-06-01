from django.urls import path
from .views import (
    create_razorpay_order,
    verify_razorpay_payment,
    capture_razorpay_payment,
    refund_razorpay_payment,
    get_razorpay_payment,
)

urlpatterns = [
    # Razorpay payment endpoints
    path("razorpay/create-order/", create_razorpay_order, name="create_razorpay_order"),
    path("razorpay/verify-payment/", verify_razorpay_payment, name="verify_razorpay_payment"),
    path("razorpay/capture/", capture_razorpay_payment, name="capture_razorpay_payment"),
    path("razorpay/refund/", refund_razorpay_payment, name="refund_razorpay_payment"),
    path("razorpay/payment/<str:payment_id>/", get_razorpay_payment, name="get_razorpay_payment"),
]
