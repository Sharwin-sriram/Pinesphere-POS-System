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
