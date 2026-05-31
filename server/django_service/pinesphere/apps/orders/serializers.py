from rest_framework import serializers
from . import models


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.OrderItem
        fields = ['id', 'name', 'quantity', 'unit_price', 'modifiers', 'total_price', 'status']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    restaurant_name = serializers.SerializerMethodField()

    class Meta:
        model = models.Order
        fields = [
            'id', 'external_id', 'restaurant_id', 'restaurant_name', 'branch_id', 'customer_id',
            'status', 'source', 'delivery_type', 'delivery_address', 'scheduled_at', 'placed_at',
            'total_amount', 'currency', 'metadata', 'items', 'created_at', 'updated_at',
        ]

    def get_restaurant_name(self, obj):
        if obj.restaurant_id:
            try:
                from authentication.models import Restaurant
                restaurant = Restaurant.objects.get(id=obj.restaurant_id)
                return restaurant.name
            except Exception:
                pass
        return None


class DeliveryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DeliveryDetail
        fields = ['courier_name', 'courier_contact', 'tracking_id', 'eta', 'picked_at', 'delivered_at']


class PaymentReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PaymentReference
        fields = ['id', 'amount', 'status', 'provider', 'provider_reference', 'metadata', 'created_at']
