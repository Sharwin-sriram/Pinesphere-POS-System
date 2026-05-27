from django.db import models


class Supplier(models.Model):

    supplier_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()

    def __str__(self):
        return self.supplier_name


class Inventory(models.Model):

    CATEGORY_CHOICES = (
        ('Vegetables', 'Vegetables'),
        ('Meat', 'Meat'),
        ('Dairy', 'Dairy'),
        ('Beverages', 'Beverages'),
    )

    UNIT_CHOICES = (
        ('Kg', 'Kg'),
        ('Litre', 'Litre'),
        ('Pieces', 'Pieces'),
    )

    item_name = models.CharField(max_length=100)

    sku = models.CharField(
        max_length=50,
        unique=True
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    unit_type = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES
    )

    quantity = models.FloatField(default=0)

    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    tax = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    expiry_date = models.DateField()

    reorder_level = models.IntegerField()

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.item_name


class PurchaseOrder(models.Model):

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Received', 'Received'),
        ('Cancelled', 'Cancelled'),
    )

    inventory_item = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE
    )

    quantity = models.IntegerField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )

    order_date = models.DateField(
        auto_now_add=True
    )

    def __str__(self):
        return f"PO-{self.id}"


class StockMovement(models.Model):

    MOVEMENT_TYPES = (
        ('IN', 'IN'),
        ('OUT', 'OUT'),
        ('WASTAGE', 'WASTAGE'),
    )

    inventory_item = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE
    )

    movement_type = models.CharField(
        max_length=20,
        choices=MOVEMENT_TYPES
    )

    quantity = models.FloatField()

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.inventory_item.item_name} - {self.movement_type}"