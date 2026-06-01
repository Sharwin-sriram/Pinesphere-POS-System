from django.db import models


class Floor(models.Model):
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    layout_json = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Table(models.Model):
    STATUSES = (
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('RESERVED', 'Reserved'),
        ('CLEANING', 'Cleaning'),
        ('BILLING_PENDING', 'Billing Pending'),
    )

    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=100)
    capacity = models.IntegerField(default=1)
    status = models.CharField(max_length=30, choices=STATUSES, default='AVAILABLE')
    current_order = models.ForeignKey('billing.Order', null=True, blank=True, on_delete=models.SET_NULL, related_name='current_order_for_table')
    is_merged = models.BooleanField(default=False)
    merged_into = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='merged_from')
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class TableMerge(models.Model):
    source_tables = models.ManyToManyField(Table, related_name='merge_sources')
    target_table = models.ForeignKey(Table, related_name='merge_target', on_delete=models.CASCADE)
    merged_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)


class Reservation(models.Model):
    STATUS = (('BOOKED', 'Booked'), ('CANCELLED', 'Cancelled'), ('SEATED', 'Seated'))
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    customer = models.ForeignKey('authentication.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='reservations')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS, default='BOOKED')
    party_size = models.IntegerField(default=1)
    created_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    deleted_at = models.DateTimeField(null=True, blank=True)


class TableStatusHistory(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    status = models.CharField(max_length=30)
    changed_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    order = models.ForeignKey('billing.Order', null=True, blank=True, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True)
