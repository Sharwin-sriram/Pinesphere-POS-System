import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")
django.setup()

from pinesphere.apps.orders.models import Order as PinesphereOrder

try:
    print("Trying to query PinesphereOrder...")
    count = PinesphereOrder.objects.count()
    print("PinesphereOrder count:", count)
except Exception as e:
    print("PinesphereOrder query failed:", e)
