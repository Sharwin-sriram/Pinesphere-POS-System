from rest_framework import serializers
from . import models


class PaymentGatewaySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PaymentGateway
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Transaction
        fields = '__all__'


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SubscriptionPlan
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Subscription
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Invoice
        fields = '__all__'


class OrderCreationSerializer(serializers.Serializer):
    """Serializer for validating Razorpay order creation request parameters."""

    amount = serializers.IntegerField(
        min_value=100,  # Minimum amount in paise (e.g. 1 INR is 100 paise)
        help_text="Amount in paise (must be a positive integer >= 100)"
    )
    currency = serializers.CharField(
        max_length=3,
        default="INR",
        help_text="3-letter currency code (e.g. INR)"
    )
    receipt = serializers.CharField(
        max_length=40,
        help_text="Receipt identifier for the order"
    )
    notes = serializers.JSONField(
        default=dict,
        required=False,
        help_text="Additional key-value notes for the order"
    )

    def validate_amount(self, value: int) -> int:
        """Validate that amount is a positive integer."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be a positive integer in paise.")
        return value

    def validate_currency(self, value: str) -> str:
        """Validate that the currency code is uppercase and valid."""
        value = value.strip().upper()
        if len(value) != 3:
            raise serializers.ValidationError("Currency code must be exactly 3 characters.")
        return value


class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for verifying the client-side signature returned by Razorpay."""

    razorpay_order_id = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255
    )
    razorpay_payment_id = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255
    )
    razorpay_signature = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255
    )


class RefundSerializer(serializers.Serializer):
    """Serializer for creating full or partial refunds."""

    payment_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the payment to be refunded"
    )
    amount = serializers.IntegerField(
        required=False,
        min_value=100,
        help_text="Optional amount in paise for partial refunds. If omitted, a full refund will be issued."
    )

    def validate_amount(self, value: int) -> int:
        """Validate that the refund amount is a positive integer."""
        if value <= 0:
            raise serializers.ValidationError("Refund amount must be a positive integer in paise.")
        return value

