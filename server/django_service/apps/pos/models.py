from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class MenuCategory(models.Model):
    """Menu categories for a restaurant"""
    restaurant_id = models.CharField(max_length=50, db_index=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    emoji = models.CharField(max_length=16, blank=True, default="")
    color = models.CharField(max_length=32, blank=True, default="slate")
    is_active = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    kds_station_id = models.CharField(max_length=64, blank=True, default="")
    parent_id = models.CharField(max_length=64, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('restaurant_id', 'name')
        indexes = [
            models.Index(fields=['restaurant_id']),
            models.Index(fields=['restaurant_id', 'name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.restaurant_id})"


class MenuItem(models.Model):
    """Menu items for a restaurant"""
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Out of Stock', 'Out of Stock'),
    )

    restaurant_id = models.CharField(max_length=50, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=100, blank=True, default="General", db_index=True)
    is_veg = models.BooleanField(default=True)
    tags = models.JSONField(default=list, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    image_url = models.URLField(blank=True, null=True)
    available_days = models.JSONField(default=list, blank=True)
    available_hours = models.JSONField(default=dict, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['restaurant_id']),
            models.Index(fields=['restaurant_id', 'category']),
            models.Index(fields=['restaurant_id', 'status']),
            models.Index(fields=['restaurant_id', 'name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.restaurant_id})"

class Role(models.Model):
    """Staff roles for a restaurant"""
    restaurant_id = models.CharField(max_length=50, db_index=True)
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=50, default="blue")  # For UI badge colors
    icon = models.CharField(max_length=64, blank=True, default="")
    is_system = models.BooleanField(default=False)
    permissions = models.JSONField(default=dict, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('restaurant_id', 'name')
        indexes = [
            models.Index(fields=['restaurant_id']),
        ]

    def __str__(self):
        return f"{self.name} ({self.restaurant_id})"


class Shift(models.Model):
    """Work shifts for a restaurant"""
    restaurant_id = models.CharField(max_length=50, db_index=True)
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    days_of_week = models.JSONField(default=list, blank=True)
    role_ids = models.JSONField(default=list, blank=True)
    min_staff = models.PositiveIntegerField(default=0)
    staff_assignments = models.JSONField(default=list, blank=True)
    overtime_threshold_hours = models.PositiveIntegerField(default=40)
    allow_swaps = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['restaurant_id']),
        ]

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"


class StaffMember(models.Model):
    """Staff members for a restaurant"""
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('On Leave', 'On Leave'),
    )
    
    EMPLOYMENT_TYPE_CHOICES = (
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
    )

    restaurant_id = models.CharField(max_length=50, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=20)
    dob = models.DateField(null=True, blank=True)
    profile_photo = models.URLField(blank=True, default="")
    
    role = models.CharField(max_length=100)  # References Role.name
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='Full-time')
    date_joined = models.DateField()
    salary_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    
    assigned_shift = models.CharField(max_length=50, blank=True)  # References Shift.id
    pin = models.CharField(max_length=4, null=True, blank=True)
    admin_access = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            ('restaurant_id', 'email'),
            ('restaurant_id', 'pin'),
        )
        indexes = [
            models.Index(fields=['restaurant_id']),
            models.Index(fields=['restaurant_id', 'status']),
            models.Index(fields=['restaurant_id', 'role']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class Cart(models.Model):
    """Shopping cart for a user"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    restaurant_id = models.CharField(max_length=50, null=True, blank=True)  # Track which restaurant items are from
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"Cart for {self.user.email}"

    def get_total(self):
        """Calculate cart total"""
        return sum(item.get_subtotal() for item in self.items.all())

    def get_item_count(self):
        """Get total number of items in cart"""
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Individual items in a shopping cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item_id = models.CharField(max_length=100)  # Reference to menu item
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image = models.URLField(blank=True, null=True)
    restaurant = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'menu_item_id')
        indexes = [
            models.Index(fields=['cart']),
            models.Index(fields=['menu_item_id']),
        ]

    def __str__(self):
        return f"{self.name} (x{self.quantity})"

    def get_subtotal(self):
        """Calculate subtotal for this item"""
        return self.price * self.quantity


class Address(models.Model):
    """User delivery addresses"""
    ADDRESS_TYPE_CHOICES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPE_CHOICES, default='home')
    street_address = models.CharField(max_length=255)
    apartment_suite = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    phone = models.CharField(max_length=20, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['user', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.address_type.title()} - {self.street_address}, {self.city}"
    
    def get_full_address(self):
        """Get formatted full address"""
        parts = [self.street_address]
        if self.apartment_suite:
            parts.append(self.apartment_suite)
        parts.extend([self.city, self.state, self.postal_code, self.country])
        return ", ".join(parts)
