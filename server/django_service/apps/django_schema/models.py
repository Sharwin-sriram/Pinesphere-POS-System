from django.db import models


class Customer(models.Model):
    id = models.AutoField(primary_key=True)
    branch_id = models.IntegerField()
    mobile = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    anniversary = models.DateField(null=True, blank=True)
    loyalty_points = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    visit_count = models.IntegerField(default=0)
    preferred_items = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"django_schema"."customers"'

    def __str__(self):
        return self.name or self.mobile


class LoyaltyPoint(models.Model):
    id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="points")
    order_id = models.IntegerField(null=True, blank=True)
    type = models.CharField(max_length=32)
    points = models.IntegerField()
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"django_schema"."loyalty_points"'


class LoyaltyTier(models.Model):
    id = models.AutoField(primary_key=True)
    restaurant_id = models.IntegerField()
    tier_name = models.CharField(max_length=64)
    min_points = models.IntegerField()
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    benefits = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = '"django_schema"."loyalty_tiers"'


class InventoryItem(models.Model):
    id = models.AutoField(primary_key=True)
    branch_id = models.IntegerField()
    supplier_id = models.IntegerField(null=True, blank=True)
    sku = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=128, null=True, blank=True)
    unit_type = models.CharField(max_length=64, null=True, blank=True)
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expiry_date = models.DateField(null=True, blank=True)
    batch_number = models.CharField(max_length=128, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = '"django_schema"."inventory_items"'


class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    menu_item_id = models.IntegerField()
    inventory_item_id = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity_used = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=32)

    class Meta:
        db_table = '"django_schema"."recipes"'


class Supplier(models.Model):
    id = models.AutoField(primary_key=True)
    branch_id = models.IntegerField()
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    mobile = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    gst_number = models.CharField(max_length=128, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = '"django_schema"."suppliers"'


class PurchaseOrder(models.Model):
    id = models.AutoField(primary_key=True)
    branch_id = models.IntegerField()
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    po_number = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=32)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    ordered_at = models.DateTimeField()
    received_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."purchase_orders"'


class PurchaseOrderItem(models.Model):
    id = models.AutoField(primary_key=True)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = '"django_schema"."purchase_order_items"'


class StockMovement(models.Model):
    id = models.AutoField(primary_key=True)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    branch_id = models.IntegerField()
    type = models.CharField(max_length=32)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    reference_id = models.IntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"django_schema"."stock_movements"'


class WastageLog(models.Model):
    id = models.AutoField(primary_key=True)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    branch_id = models.IntegerField()
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    reason = models.TextField(null=True, blank=True)
    logged_by = models.IntegerField(null=True, blank=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"django_schema"."wastage_logs"'


class Employee(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    branch_id = models.IntegerField()
    designation = models.CharField(max_length=128, null=True, blank=True)
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    join_date = models.DateField(null=True, blank=True)
    bank_account = models.CharField(max_length=64, null=True, blank=True)
    ifsc_code = models.CharField(max_length=32, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = '"django_schema"."employees"'


class Attendance(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    method = models.CharField(max_length=32, null=True, blank=True)
    total_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=32, null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."attendance"'


class LeaveRequest(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=64)
    from_date = models.DateField()
    to_date = models.DateField()
    reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=32, null=True, blank=True)
    approved_by = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."leave_requests"'


class Payroll(models.Model):
    id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.IntegerField()
    year = models.IntegerField()
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    incentives = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    paid_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=32, null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."payroll"'


class Expense(models.Model):
    id = models.AutoField(primary_key=True)
    branch_id = models.IntegerField()
    category = models.CharField(max_length=128)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    receipt_url = models.URLField(null=True, blank=True)
    expense_date = models.DateField(null=True, blank=True)
    added_by = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."expenses"'


class DeliveryRider(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    branch_id = models.IntegerField()
    vehicle_type = models.CharField(max_length=64, null=True, blank=True)
    vehicle_number = models.CharField(max_length=64, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."delivery_riders"'


class Delivery(models.Model):
    id = models.AutoField(primary_key=True)
    order_id = models.IntegerField()
    rider = models.ForeignKey(DeliveryRider, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=32)
    otp = models.CharField(max_length=16, null=True, blank=True)
    pickup_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    delivery_address = models.JSONField(default=dict, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = '"django_schema"."deliveries"'


class AuditLog(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField(null=True, blank=True)
    action = models.CharField(max_length=128)
    entity = models.CharField(max_length=128)
    entity_id = models.CharField(max_length=128, null=True, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"django_schema"."audit_logs"'
