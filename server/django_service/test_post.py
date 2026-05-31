import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")
django.setup()

from authentication.models import Restaurant, Branch, User
from pinesphere.apps.orders.views import OrderViewSet
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

# Let's find a user
user = User.objects.filter(role="CUSTOMER").first() or User.objects.first()
restaurant = Restaurant.objects.first()

print(f"Using user: {user.email if user else 'None'}")
print(f"Using restaurant: {restaurant.name if restaurant else 'None'}")

# Create request payload
payload = {
    "restaurant_id": str(restaurant.id) if restaurant else None,
    "branch_id": None,
    "source": "web",
    "delivery_type": "pickup",
    "customer_id": user.id if user else None,
    "external_id": "test_simulate_12345",
    "customer_name": "Test Customer",
    "customer_phone": "1234567890",
    "items": []
}

factory = APIRequestFactory()
wsgi_request = factory.post("/api/v1/orders/", payload, format="json")

viewset = OrderViewSet()
# Wrap in DRF request
drf_request = Request(wsgi_request)
drf_request.user = user
drf_request._request = wsgi_request  # link the underlying django request

# Set parser context and authenticate
drf_request.parser_context = {'view': viewset, 'args': (), 'kwargs': {}}

try:
    # Set the data directly to bypass parsing
    drf_request._full_data = payload
    
    response = viewset.create(drf_request)
    print("Direct Status:", response.status_code)
    print("Direct Data:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
