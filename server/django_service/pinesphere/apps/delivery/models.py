from django.db import models


class DeliveryCourier(models.Model):
    STATUS_AVAILABLE = 'available'
    STATUS_BUSY = 'busy'
    STATUS_OFF = 'off_shift'

    STATUS_CHOICES = [
        (STATUS_AVAILABLE, 'Available'),
        (STATUS_BUSY, 'Busy'),
        (STATUS_OFF, 'Off shift'),
    ]

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=64, null=True, blank=True)
    vehicle_type = models.CharField(max_length=64, null=True, blank=True)
    vehicle_number = models.CharField(max_length=64, null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)
    current_branch_id = models.BigIntegerField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'delivery_courier'

    def __str__(self):
        return self.name


class Delivery(models.Model):
    STATUS_REQUESTED = 'requested'
    STATUS_ASSIGNED = 'assigned'
    STATUS_PICKED = 'picked'
    STATUS_IN_TRANSIT = 'in_transit'
    STATUS_DELIVERED = 'delivered'
    STATUS_FAILED = 'failed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_REQUESTED, 'Requested'),
        (STATUS_ASSIGNED, 'Assigned'),
        (STATUS_PICKED, 'Picked'),
        (STATUS_IN_TRANSIT, 'In transit'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    id = models.BigAutoField(primary_key=True)
    order_id = models.BigIntegerField(unique=True)
    courier = models.ForeignKey(DeliveryCourier, null=True, blank=True, on_delete=models.SET_NULL, related_name='deliveries')
    restaurant_id = models.BigIntegerField(null=True, blank=True)
    branch_id = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
    pickup_address = models.TextField(null=True, blank=True)
    dropoff_address = models.TextField(null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    picked_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    eta = models.DateTimeField(null=True, blank=True)
    tracking_id = models.CharField(max_length=255, null=True, blank=True)
    courier_contact = models.CharField(max_length=64, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'delivery_delivery'

    def __str__(self):
        return f"Delivery {self.id} for order {self.order_id} ({self.status})"


class DeliveryEvent(models.Model):
    EVENT_STATUS = 'status_change'
    EVENT_LOCATION = 'location_update'
    EVENT_NOTE = 'note'

    EVENT_CHOICES = [
        (EVENT_STATUS, 'Status change'),
        (EVENT_LOCATION, 'Location update'),
        (EVENT_NOTE, 'Note'),
    ]

    id = models.BigAutoField(primary_key=True)
    delivery = models.ForeignKey(Delivery, related_name='events', on_delete=models.CASCADE)
    event_type = models.CharField(max_length=64, choices=EVENT_CHOICES)
    location = models.JSONField(null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'delivery_event'

    def __str__(self):
        return f"Event {self.event_type} for delivery {self.delivery_id}"


class ExternalCourierProvider(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    provider_key = models.CharField(max_length=255, null=True, blank=True)
    provider_secret = models.CharField(max_length=255, null=True, blank=True)
    config = models.JSONField(null=True, blank=True)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'delivery_provider'

    def __str__(self):
        return self.name
