from django.db import models


class Category(models.Model):
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    order = models.IntegerField(default=0)
    deleted_at = models.DateTimeField(null=True, blank=True)


class MenuItem(models.Model):
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class ModifierGroup(models.Model):
    name = models.CharField(max_length=200)
    min_select = models.IntegerField(default=0)
    max_select = models.IntegerField(default=0)
    required = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Modifier(models.Model):
    group = models.ForeignKey(ModifierGroup, related_name='modifiers', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    price_delta = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Combo(models.Model):
    restaurant = models.ForeignKey('authentication.Restaurant', on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    components = models.JSONField()  # list of {menu_item_id, qty, price}
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class ItemPricing(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    day_of_week = models.CharField(max_length=20, null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class ItemAvailability(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    branch = models.ForeignKey('billing.Branch', on_delete=models.CASCADE)
    available_from = models.TimeField(null=True, blank=True)
    available_to = models.TimeField(null=True, blank=True)
    days = models.CharField(max_length=50, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)


class Recipe(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    components = models.JSONField()  # list of {inventory_item_id, qty}
    deleted_at = models.DateTimeField(null=True, blank=True)
