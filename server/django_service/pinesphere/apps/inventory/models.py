from django.db import models


class InventoryItem(models.Model):
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    item_code = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=255)
    uom = models.CharField(max_length=50, default='pcs')
    current_stock = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    avg_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class PurchaseOrder(models.Model):
    STATUS = (('OPEN', 'Open'), ('GRN_RECEIVED', 'GRN Received'), ('CLOSED', 'Closed'), ('CANCELLED', 'Cancelled'))
    po_number = models.CharField(max_length=100)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS, default='OPEN')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='items', on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    qty_ordered = models.DecimalField(max_digits=12, decimal_places=3)
    qty_received = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    deleted_at = models.DateTimeField(null=True, blank=True)


class StockTransfer(models.Model):
    STATUS = (('INITIATED', 'Initiated'), ('IN_TRANSIT', 'In Transit'), ('RECEIVED', 'Received'))
    from_branch = models.ForeignKey('billing.Branch', related_name='transfers_out', on_delete=models.CASCADE)
    to_branch = models.ForeignKey('billing.Branch', related_name='transfers_in', on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    qty = models.DecimalField(max_digits=12, decimal_places=3)
    status = models.CharField(max_length=20, choices=STATUS, default='INITIATED')
    created_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class StockAdjustment(models.Model):
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    qty_change = models.DecimalField(max_digits=12, decimal_places=3)
    reason = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey('authentication.User', null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class StockLedger(models.Model):
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    change_type = models.CharField(max_length=50)
    qty = models.DecimalField(max_digits=12, decimal_places=3)
    balance_after = models.DecimalField(max_digits=12, decimal_places=3)
    ref_id = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
