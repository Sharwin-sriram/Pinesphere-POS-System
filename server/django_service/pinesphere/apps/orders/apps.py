from pathlib import Path

from django.apps import AppConfig


class PinesphereOrdersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pinesphere.apps.orders"
    label = "pinesphere_orders"
    verbose_name = "Pinesphere Orders"
    path = str(Path(__file__).resolve().parent)
