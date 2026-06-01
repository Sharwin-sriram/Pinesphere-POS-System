import uuid
from django.conf import settings
from django.db import models


class PaymentGateway(models.Model):
    name = models.CharField(max_length=100)
    provider = models.CharField(max_length=100)
    config = models.JSONField(null=True, blank=True)
    active = models.BooleanField(default=True)


class Transaction(models.Model):
    STATUS = (('PENDING', 'Pending'), ('SUCCESS', 'Success'), ('FAILED', 'Failed'))

    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    order = models.ForeignKey('billing.Order', null=True, blank=True, on_delete=models.SET_NULL)
    gateway = models.ForeignKey(PaymentGateway, null=True, blank=True, on_delete=models.SET_NULL)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    provider_reference = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    interval = models.CharField(max_length=20, choices=(('MONTH', 'Monthly'), ('YEAR', 'Yearly')))
    active = models.BooleanField(default=True)


class Subscription(models.Model):
    STATUS = (('ACTIVE', 'Active'), ('PAST_DUE', 'Past Due'), ('CANCELLED', 'Cancelled'))

    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS, default='ACTIVE')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)


class Invoice(models.Model):
    STATUS = (('DUE', 'Due'), ('PAID', 'Paid'), ('VOID', 'Void'))

    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    subscription = models.ForeignKey(Subscription, null=True, blank=True, on_delete=models.SET_NULL)
    order = models.ForeignKey('billing.Order', null=True, blank=True, on_delete=models.SET_NULL)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    issued_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default='DUE')


class PaymentStatus(models.TextChoices):
    """Available statuses for a payment transaction."""

    PENDING = "PENDING", "Pending"
    PAID = "PAID", "Paid"
    FAILED = "FAILED", "Failed"
    REFUNDED = "REFUNDED", "Refunded"
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED", "Partially Refunded"


class Payment(models.Model):
    """Payment transaction details linked to Razorpay orders and Django users."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payments")
    razorpay_order_id = models.CharField(max_length=255, unique=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    amount = models.PositiveIntegerField()  # stored in PAISE
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=32, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    receipt = models.CharField(max_length=40)
    notes = models.JSONField(default=dict, blank=True)
    idempotency_key = models.CharField(max_length=255, unique=True, null=True, blank=True)  # for refunds
    metadata = models.JSONField(default=dict, blank=True)  # raw Razorpay response details
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["razorpay_order_id"]),
        ]

    def __str__(self) -> str:
        return f"Payment {self.id} - {self.status} ({self.amount} {self.currency})"


class PaymentEvent(models.Model):
    """Audit log of events (webhooks, state transitions) related to a payment."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.PROTECT, related_name="events")
    event = models.CharField(max_length=255)  # e.g., "payment.captured", "refund.created"
    payload = models.JSONField()  # raw webhook/action payload
    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Event {self.event} on Payment {self.payment_id} at {self.received_at}"

