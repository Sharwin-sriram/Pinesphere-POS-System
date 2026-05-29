from django.db import models


class Customer(models.Model):
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    mobile = models.CharField(max_length=20, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    anniversary = models.DateField(null=True, blank=True)
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class LoyaltyTransaction(models.Model):
    TYPES = (('EARN', 'Earn'), ('REDEEM', 'Redeem'))
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order = models.ForeignKey('billing.Order', null=True, blank=True, on_delete=models.SET_NULL)
    points = models.IntegerField()
    type = models.CharField(max_length=10, choices=TYPES)
    balance_after = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)


class Feedback(models.Model):
    customer = models.ForeignKey(Customer, null=True, blank=True, on_delete=models.SET_NULL)
    order = models.ForeignKey('billing.Order', null=True, blank=True, on_delete=models.SET_NULL)
    rating = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Campaign(models.Model):
    TYPES = (('BIRTHDAY', 'Birthday'), ('ANNIVERSARY', 'Anniversary'), ('GENERAL', 'General'))
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPES)
    payload = models.JSONField()
    schedule = models.JSONField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
