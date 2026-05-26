from django.apps import AppConfig


class KitchenDisplaySystemConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.kitchen_display_system'
    verbose_name = 'Kitchen Display System (KDS)'

    def ready(self):
        import apps.kitchen_display_system.signals  # noqa
