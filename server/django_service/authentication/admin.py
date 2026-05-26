"""Admin registrations for authentication models."""

from django.contrib import admin

from .models import User, UserSession


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "mobile", "role", "branch_id", "restaurant_id", "is_active", "is_staff")
    search_fields = ("email", "mobile")
    list_filter = ("role", "is_active", "is_staff", "branch_id")


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "device_id", "device_type", "ip_address", "is_active", "last_active")
    search_fields = ("device_id", "user__mobile", "user__email")
    list_filter = ("device_type", "is_active")
