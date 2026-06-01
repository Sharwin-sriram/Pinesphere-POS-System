from django.db import models


class Branch(models.Model):
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    state = models.CharField(max_length=100)
    service_charge_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    deleted_at = models.DateTimeField(null=True, blank=True)


class MenuItem(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_profile = models.ForeignKey('billing.TaxProfile', null=True, blank=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class TaxProfile(models.Model):
    cgst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    sgst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    igst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)


class Coupon(models.Model):
    code = models.CharField(max_length=64, unique=True)
    discount_type = models.CharField(max_length=10, choices=(('PERCENT', 'Percent'), ('FIXED', 'Fixed')))
    value = models.DecimalField(max_digits=10, decimal_places=2)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    usage_limit = models.IntegerField(null=True, blank=True)
    per_customer_limit = models.IntegerField(null=True, blank=True)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)


class Order(models.Model):
    ORDER_TYPES = (('DINEIN', 'Dine In'), ('TAKEAWAY', 'Takeaway'), ('DELIVERY', 'Delivery'))
    STATUS = (('OPEN', 'Open'), ('HELD', 'Held'), ('CLOSED', 'Closed'), ('CANCELLED', 'Cancelled'))

    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    table = models.ForeignKey('tables.Table', null=True, blank=True, on_delete=models.SET_NULL)
    customer = models.ForeignKey('authentication.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='orders_as_customer')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPES)
    status = models.CharField(max_length=20, choices=STATUS, default='OPEN')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL, related_name='orders_created')


class OrderItem(models.Model):
    STATUS = (('NEW', 'New'), ('PREPARING', 'Preparing'), ('SERVED', 'Served'), ('VOIDED', 'Voided'))
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    qty = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    modifiers = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Payment(models.Model):
    MODES = (('CASH', 'Cash'), ('CARD', 'Card'), ('UPI', 'UPI'), ('WALLET', 'Wallet'), ('OTHER', 'Other'))
    order = models.ForeignKey(Order, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    mode = models.CharField(max_length=20, choices=MODES)
    reference = models.CharField(max_length=255, null=True, blank=True)
    processed_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Refund(models.Model):
    payment = models.ForeignKey(Payment, related_name='refunds', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(null=True, blank=True)
    processed_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
