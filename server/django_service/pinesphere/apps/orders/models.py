from django.db import models
from django.conf import settings


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_PREPARING = 'preparing'
    STATUS_READY = 'ready'
    STATUS_OUT_FOR_DELIVERY = 'out_for_delivery'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'
    STATUS_REFUNDED = 'refunded'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_PREPARING, 'Preparing'),
        (STATUS_READY, 'Ready'),
        (STATUS_OUT_FOR_DELIVERY, 'Out for delivery'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_REFUNDED, 'Refunded'),
    ]

    SOURCE_WEB = 'web'
    SOURCE_MOBILE = 'mobile'
    SOURCE_AGGREGATOR = 'aggregator'

    SOURCE_CHOICES = [
        (SOURCE_WEB, 'Web'),
        (SOURCE_MOBILE, 'Mobile'),
        (SOURCE_AGGREGATOR, 'Aggregator'),
    ]

    DELIVERY_DINEIN = 'dinein'
    DELIVERY_PICKUP = 'pickup'
    DELIVERY_DELIVERY = 'delivery'

    DELIVERY_CHOICES = [
        (DELIVERY_DINEIN, 'Dine-in'),
        (DELIVERY_PICKUP, 'Pickup'),
        (DELIVERY_DELIVERY, 'Delivery'),
    ]

    id = models.BigAutoField(primary_key=True)
    external_id = models.CharField(max_length=255, null=True, blank=True)
    restaurant_id = models.BigIntegerField(null=True, blank=True)
    branch_id = models.BigIntegerField(null=True, blank=True)
    customer_id = models.BigIntegerField(null=True, blank=True)
    billing_order_id = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING)
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default=SOURCE_WEB)
    delivery_type = models.CharField(max_length=32, choices=DELIVERY_CHOICES, default=DELIVERY_PICKUP)
    delivery_address = models.TextField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    placed_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='INR')
    metadata = models.JSONField(null=True, blank=True)
    created_by_id = models.BigIntegerField(null=True, blank=True)
    updated_by_id = models.BigIntegerField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders_order'

    def __str__(self):
        return f"Order {self.id} ({self.status})"


class OrderItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item_id = models.BigIntegerField(null=True, blank=True)
    menu_item_snapshot = models.JSONField(null=True, blank=True)
    name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    modifiers = models.JSONField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=32, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders_orderitem'

    def __str__(self):
        return f"{self.name} x{self.quantity}"


class DeliveryDetail(models.Model):
    order = models.OneToOneField(Order, related_name='delivery', on_delete=models.CASCADE)
    courier_name = models.CharField(max_length=255, null=True, blank=True)
    courier_contact = models.CharField(max_length=64, null=True, blank=True)
    tracking_id = models.CharField(max_length=255, null=True, blank=True)
    eta = models.DateTimeField(null=True, blank=True)
    picked_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders_deliverydetail'


class PaymentReference(models.Model):
    STATUS_CREATED = 'created'
    STATUS_PAID = 'paid'
    STATUS_FAILED = 'failed'
    STATUS_REFUNDED = 'refunded'

    STATUS_CHOICES = [
        (STATUS_CREATED, 'Created'),
        (STATUS_PAID, 'Paid'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
    ]

    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_CREATED)
    provider = models.CharField(max_length=64, null=True, blank=True)
    provider_reference = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders_paymentreference'
