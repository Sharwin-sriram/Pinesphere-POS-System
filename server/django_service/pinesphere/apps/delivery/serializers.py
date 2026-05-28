from rest_framework import serializers
from . import models


class DeliveryCourierSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DeliveryCourier
        fields = ['id', 'name', 'phone', 'vehicle_type', 'vehicle_number', 'status', 'current_branch_id', 'metadata']


class DeliveryEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.DeliveryEvent
        fields = ['id', 'event_type', 'location', 'payload', 'created_at']


class DeliverySerializer(serializers.ModelSerializer):
    events = DeliveryEventSerializer(many=True, read_only=True)
    courier = DeliveryCourierSerializer(read_only=True)

    class Meta:
        model = models.Delivery
        fields = [
            'id', 'order_id', 'courier', 'restaurant_id', 'branch_id', 'status', 'pickup_address',
            'dropoff_address', 'requested_at', 'assigned_at', 'picked_at', 'delivered_at', 'eta',
            'tracking_id', 'courier_contact', 'notes', 'metadata', 'events', 'created_at', 'updated_at'
        ]
