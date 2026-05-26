"""Authentication data models."""

from __future__ import annotations

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for the authentication user model."""

    def create_user(self, mobile, password=None, **extra_fields):
        """Create and persist a regular user."""

        if not mobile:
            raise ValueError("The mobile field must be set.")
        mobile = str(mobile).strip()
        email = extra_fields.get("email")
        if email == "":
            extra_fields["email"] = None
        user = self.model(mobile=mobile, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password=None, **extra_fields):
        """Create and persist a staff user for administrative access."""

        extra_fields.setdefault("role", User.RoleChoices.SUPER_ADMIN)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", True)
        return self.create_user(mobile, password=password, **extra_fields)


class User(AbstractBaseUser):
    """Custom application user."""

    class RoleChoices(models.TextChoices):
        SUPER_ADMIN = "SUPER_ADMIN", "SUPER_ADMIN"
        ORGANIZATION_OWNER = "ORGANIZATION_OWNER", "ORGANIZATION_OWNER"
        BRANCH_MANAGER = "BRANCH_MANAGER", "BRANCH_MANAGER"
        CASHIER = "CASHIER", "CASHIER"
        WAITER = "WAITER", "WAITER"
        KITCHEN_STAFF = "KITCHEN_STAFF", "KITCHEN_STAFF"
        INVENTORY_MANAGER = "INVENTORY_MANAGER", "INVENTORY_MANAGER"
        ACCOUNTANT = "ACCOUNTANT", "ACCOUNTANT"
        DELIVERY_STAFF = "DELIVERY_STAFF", "DELIVERY_STAFF"
        CUSTOMER = "CUSTOMER", "CUSTOMER"

    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True, null=True, blank=True, db_index=True)
    mobile = models.CharField(max_length=20, unique=True, db_index=True)
    # store hashed password in column named `password_hash` to match DB map
    password = models.CharField(max_length=128, db_column="password_hash")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=32, choices=RoleChoices.choices, db_index=True)
    restaurant_id = models.IntegerField(null=True, blank=True)
    branch_id = models.IntegerField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "mobile"
    REQUIRED_FIELDS = ["email", "first_name", "last_name", "role"]

    class Meta:
        db_table = '"shared_schema"."users"'
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["mobile"]),
            models.Index(fields=["role"]),
            models.Index(fields=["branch_id"]),
        ]

    def __str__(self):
        return self.email or self.mobile

    def has_perm(self, perm, obj=None):
        return self.is_active and self.is_staff

    def has_module_perms(self, app_label):
        return self.is_active and self.is_staff


class UserSession(models.Model):
    """Tracks a login session for a specific device."""

    class DeviceType(models.TextChoices):
        POS = "POS", "POS"
        MOBILE = "MOBILE", "MOBILE"
        WEB = "WEB", "WEB"
        TABLET = "TABLET", "TABLET"

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions")
    device_id = models.CharField(max_length=255)
    device_type = models.CharField(max_length=16, choices=DeviceType.choices)
    ip_address = models.GenericIPAddressField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"shared_schema"."user_sessions"'
        indexes = [
            models.Index(fields=["device_id"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.device_id}"
