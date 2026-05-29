from rest_framework import serializers
from . import models


class OrderItemWriteSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)
    modifiers = serializers.JSONField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class OrderWriteSerializer(serializers.Serializer):
    branch_id = serializers.IntegerField()
    order_type = serializers.ChoiceField(choices=[c[0] for c in models.Order.ORDER_TYPES])
    table_id = serializers.IntegerField(required=False, allow_null=True)
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    items = OrderItemWriteSerializer(many=True)


class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.OrderItem
        fields = ['id', 'menu_item', 'qty', 'price', 'tax', 'modifiers', 'notes', 'status']


class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True)

    class Meta:
        model = models.Order
        fields = ['id', 'branch', 'table', 'order_type', 'status', 'subtotal', 'tax_total', 'service_charge', 'discount_total', 'net_total', 'items']


class PaymentSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=[c[0] for c in models.Payment.MODES])
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reference = serializers.CharField(required=False, allow_blank=True)
