from django.db import models


class Restaurant(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)
    gst_number = models.CharField(max_length=64, null=True, blank=True)
    pan_number = models.CharField(max_length=64, null=True, blank=True)
    fssai_number = models.CharField(max_length=64, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    cuisine_type = models.JSONField(default=list, blank=True)
    business_hours = models.JSONField(default=dict, blank=True)
    logo_url = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"shared_schema"."restaurants"'

    def __str__(self):
        return self.name


class Branch(models.Model):
    id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    address = models.TextField(null=True, blank=True)
    mobile = models.CharField(max_length=20, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"shared_schema"."branches"'

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class Subscription(models.Model):
    id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.CharField(max_length=64)
    status = models.CharField(max_length=32)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    auto_renew = models.BooleanField(default=False)
    gateway_ref = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = '"shared_schema"."subscriptions"'

    def __str__(self):
        return f"{self.restaurant.name} - {self.plan}"


class MenuCategory(models.Model):
    id = models.AutoField(primary_key=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="menu_categories")
    name = models.CharField(max_length=255)
    image_url = models.URLField(null=True, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    available_from = models.TimeField(null=True, blank=True)
    available_to = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = '"shared_schema"."menu_categories"'

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    id = models.AutoField(primary_key=True)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_veg = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    prep_time_mins = models.IntegerField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    nutritional_info = models.JSONField(default=dict, blank=True)
    allergen_info = models.JSONField(default=list, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = '"shared_schema"."menu_items"'

    def __str__(self):
        return self.name


class ModifierGroup(models.Model):
    id = models.AutoField(primary_key=True)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="modifier_groups")
    name = models.CharField(max_length=255)
    is_required = models.BooleanField(default=False)
    min_select = models.IntegerField(default=0)
    max_select = models.IntegerField(default=1)

    class Meta:
        db_table = '"shared_schema"."modifier_groups"'

    def __str__(self):
        return f"{self.menu_item.name} - {self.name}"


class Modifier(models.Model):
    id = models.AutoField(primary_key=True)
    modifier_group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE, related_name="modifiers")
    name = models.CharField(max_length=255)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = '"shared_schema"."modifiers"'

    def __str__(self):
        return self.name


class TaxConfig(models.Model):
    id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="tax_configs")
    tax_name = models.CharField(max_length=255)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    applies_to = models.CharField(max_length=64)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = '"shared_schema"."tax_configs"'

    def __str__(self):
        return f"{self.tax_name} ({self.percentage}%)"
