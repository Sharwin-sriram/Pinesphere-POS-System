from pathlib import Path

from django.apps import AppConfig


class TablesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pinesphere.apps.tables"
    label = "tables"
    verbose_name = "Tables"
    path = str(Path(__file__).resolve().parent)