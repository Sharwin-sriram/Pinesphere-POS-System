"""Serializers for billing/order endpoints."""

from __future__ import annotations

from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "item_name",
            "quantity",
            "unit_price",
            "special_instructions",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    restaurant_id = serializers.SerializerMethodField()
    restaurant_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "restaurant_id",
            "restaurant_name",
            "status",
            "customer_name",
            "customer_phone",
            "total_amount",
            "notes",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_restaurant_id(self, obj):
        return str(obj.restaurant_id) if obj.restaurant_id else None

    def get_restaurant_name(self, obj):
        return obj.restaurant.name if obj.restaurant else None


class OrderCreateSerializer(serializers.Serializer):
    restaurant = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None, help_text="Restaurant UUID")
    order_type = serializers.CharField(required=False, allow_blank=True, default="table")
    table_id = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)
    branch = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)
    customer_name = serializers.CharField(required=False, allow_blank=True, default="")
    customer_phone = serializers.CharField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = serializers.ListField(child=serializers.DictField(), required=False, default=list)

    def validate_items(self, value):
        for idx, item in enumerate(value):
            if not item.get("menu_item_id") and not item.get("item_name"):
                raise serializers.ValidationError({idx: "menu_item_id or item_name is required"})
            qty = item.get("qty", 1)
            if int(qty) <= 0:
                raise serializers.ValidationError({idx: "qty must be greater than 0"})
        return value


class OrderUpdateSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=Order.ORDER_STATUS_CHOICES, required=False)
    customer_name = serializers.CharField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True)


class AddOrderItemSerializer(serializers.Serializer):
    menu_item_id = serializers.CharField(required=False, allow_blank=True)
    item_name = serializers.CharField(required=False, allow_blank=True)
    qty = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    modifiers = serializers.JSONField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if not attrs.get("menu_item_id") and not attrs.get("item_name"):
            raise serializers.ValidationError({"menu_item_id": "menu_item_id or item_name is required"})
        return attrs


class VoidOrderItemSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class HoldResumeSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class PaymentSerializer(serializers.Serializer):
    payment_lines = serializers.ListField(child=serializers.DictField(), allow_empty=False)


class RefundSerializer(serializers.Serializer):
    payment_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    reason = serializers.CharField(required=False, allow_blank=True, default="")

