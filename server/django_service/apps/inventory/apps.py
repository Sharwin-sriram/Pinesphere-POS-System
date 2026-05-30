from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.inventory'
from pathlib import Path

from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.inventory"
    label = "apps_inventory"
    verbose_name = "Legacy Inventory"
    path = str(Path(__file__).resolve().parent)

    def ready(self):
        import apps.inventory.signals

    def ready(self):
        import apps.inventory.signals