from django.db import models


class KitchenStation(models.Model):
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    assigned_categories = models.JSONField(null=True, blank=True)
    assigned_items = models.JSONField(null=True, blank=True)
    printer_info = models.JSONField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class KOT(models.Model):
    STATUS = (('NEW', 'New'), ('PREPARING', 'Preparing'), ('READY', 'Ready'), ('SERVED', 'Served'), ('CANCELLED', 'Cancelled'))
    order = models.ForeignKey('billing.Order', on_delete=models.CASCADE)
    kot_number = models.CharField(max_length=100)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    station = models.ForeignKey(KitchenStation, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=STATUS, default='NEW')
    printed_count = models.IntegerField(default=0)
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class KOTItem(models.Model):
    STATUS = (('NEW', 'New'), ('PREPARING', 'Preparing'), ('READY', 'Ready'), ('SERVED', 'Served'), ('CANCELLED', 'Cancelled'))
    kot = models.ForeignKey(KOT, related_name='items', on_delete=models.CASCADE)
    order_item = models.ForeignKey('billing.OrderItem', null=True, blank=True, on_delete=models.SET_NULL)
    menu_item = models.ForeignKey('billing.MenuItem', on_delete=models.CASCADE)
    qty = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS, default='NEW')
    prepared_by = models.ForeignKey('authentication.User', null=True, blank=True, on_delete=models.SET_NULL)
    prepared_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    modifiers = models.JSONField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class KOTReprintLog(models.Model):
    kot = models.ForeignKey(KOT, on_delete=models.CASCADE)
    requested_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
