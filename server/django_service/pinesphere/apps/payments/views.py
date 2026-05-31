from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from . import models, serializers, services


from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = models.Transaction.objects.all()
    serializer_class = serializers.TransactionSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = models.Subscription.objects.all()
    serializer_class = serializers.SubscriptionSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        sub = self.get_object()
        services.cancel_subscription(sub)
        return Response(self.get_serializer(sub).data)


@api_view(['POST'])
def gateway_webhook(request, provider):
    # Minimal webhook receiver; provider-specific parsing belongs in integrations
    payload = request.data
    # For now, just return OK and log the payload; integration logic should update transactions
    return Response({'status': 'received', 'provider': provider}, status=status.HTTP_200_OK)


from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_ratelimit.decorators import ratelimit

from .permissions import RazorpayWebhookAuthentication
from .tasks import process_webhook_event


class OrderCreationView(APIView):
    """View to create a Razorpay order.

    Rate-limited to 10 requests/min per user.
    """

    permission_classes = [IsAuthenticated]

    @method_decorator(ratelimit(key="user", rate="10/m", method="POST", block=True))
    def post(self, request):
        """Validates input, calls Razorpay SDK, and registers a PENDING payment."""
        serializer = serializers.OrderCreationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        payment = services.create_razorpay_order(
            customer=request.user,
            amount=validated_data["amount"],
            currency=validated_data.get("currency", "INR"),
            receipt=validated_data["receipt"],
            notes=validated_data.get("notes", {}),
        )

        return Response(
            {
                "order_id": payment.razorpay_order_id,
                "amount": payment.amount,
                "currency": payment.currency,
                "key_id": settings.RAZORPAY_KEY_ID,
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentVerificationView(APIView):
    """View to verify client-side signatures returned by Razorpay."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Verifies signature, logs failure or marks payment as PAID inside a transaction."""
        serializer = serializers.PaymentVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        payment = services.verify_razorpay_payment(
            razorpay_order_id=validated_data["razorpay_order_id"],
            razorpay_payment_id=validated_data["razorpay_payment_id"],
            razorpay_signature=validated_data["razorpay_signature"],
        )

        return Response(
            {
                "success": True,
                "message": "Payment verified and processed successfully.",
                "payment_id": payment.id,
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name="dispatch")
class RazorpayWebhookView(APIView):
    """CSRF-exempt endpoint for processing incoming Razorpay webhook events.

    Verifies webhook signature using RazorpayWebhookAuthentication before execution.
    """

    authentication_classes = [RazorpayWebhookAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        """Dispatches verified webhook payloads to a Celery queue for async processing."""
        event_name = request.data.get("event")
        # Dispatch the celery task asynchronously immediately
        process_webhook_event.delay(event_name, request.data)
        return Response({"status": "received"}, status=status.HTTP_200_OK)


class RefundView(APIView):
    """View to process full or partial refunds.

    Restricted to authenticated Admin users.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        """Initiates a refund request via Razorpay SDK with an idempotency key."""
        serializer = serializers.RefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        payment = services.process_refund(
            payment_id=validated_data["payment_id"],
            amount=validated_data.get("amount"),
        )

        return Response(
            {
                "success": True,
                "message": "Refund initiated and processed successfully.",
                "payment_id": payment.id,
                "status": payment.status,
            },
            status=status.HTTP_200_OK,
        )

