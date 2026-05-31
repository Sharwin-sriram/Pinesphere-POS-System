from __future__ import annotations

import uuid

from django.db import models


class RestaurantSettings(models.Model):
    """Restaurant-scoped settings bundle for admin configuration."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.OneToOneField(
        "authentication.Restaurant",
        on_delete=models.CASCADE,
        related_name="settings_profile",
    )
    logo = models.ImageField(upload_to="settings/logos/", null=True, blank=True)
    cover_photo = models.ImageField(upload_to="settings/cover-photos/", null=True, blank=True)
    tax_id = models.CharField(max_length=100, blank=True, default="")
    default_timezone = models.CharField(max_length=50, default="UTC")
    currency = models.CharField(max_length=16, default="USD")
    language = models.CharField(max_length=16, default="en")
    locale = models.CharField(max_length=32, default="en-US")
    operating_hours = models.JSONField(default=list, blank=True)
    table_count = models.PositiveIntegerField(default=0)
    floor_capacity = models.PositiveIntegerField(default=0)
    payment_settings = models.JSONField(default=dict, blank=True)
    notification_settings = models.JSONField(default=dict, blank=True)
    security_settings = models.JSONField(default=dict, blank=True)
    integration_settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "restaurant_settings"
        verbose_name = "Restaurant Settings"
        verbose_name_plural = "Restaurant Settings"

    def __str__(self) -> str:
        return f"Settings - {self.restaurant.name}"
