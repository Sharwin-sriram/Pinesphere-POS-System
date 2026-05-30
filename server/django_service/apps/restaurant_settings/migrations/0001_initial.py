# Generated manually for the restaurant settings module.

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="RestaurantSettings",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("logo", models.ImageField(blank=True, null=True, upload_to="settings/logos/")),
                ("tax_id", models.CharField(blank=True, default="", max_length=100)),
                ("default_timezone", models.CharField(default="UTC", max_length=50)),
                ("currency", models.CharField(default="USD", max_length=16)),
                ("language", models.CharField(default="en", max_length=16)),
                ("locale", models.CharField(default="en-US", max_length=32)),
                ("operating_hours", models.JSONField(blank=True, default=list)),
                ("table_count", models.PositiveIntegerField(default=0)),
                ("floor_capacity", models.PositiveIntegerField(default=0)),
                ("payment_settings", models.JSONField(blank=True, default=dict)),
                ("notification_settings", models.JSONField(blank=True, default=dict)),
                ("security_settings", models.JSONField(blank=True, default=dict)),
                ("integration_settings", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "restaurant",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="settings_profile",
                        to="authentication.restaurant",
                    ),
                ),
            ],
            options={
                "verbose_name": "Restaurant Settings",
                "verbose_name_plural": "Restaurant Settings",
                "db_table": "restaurant_settings",
            },
        ),
    ]
