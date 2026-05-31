import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")
django.setup()

from authentication.models import Restaurant, Branch

print("Restaurants:")
for r in Restaurant.objects.all():
    print(f"  Restaurant ID: {r.id}, Name: {r.name}")

print("\nBranches:")
for b in Branch.objects.all():
    print(f"  Branch ID: {b.id}, Restaurant ID: {b.restaurant_id}, Name: {b.name}")
