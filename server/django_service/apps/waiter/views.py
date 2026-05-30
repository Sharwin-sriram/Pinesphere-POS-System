from django.core import signing
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.pos.models import StaffMember, MenuItem
from pinesphere.apps.orders import services as order_services


WAITER_SALT = "waiter_portal"


def _make_token(staff_id: str) -> str:
    return signing.dumps({"staff_id": str(staff_id)}, key=settings.SECRET_KEY, salt=WAITER_SALT)


def _load_token(token: str):
    try:
        data = signing.loads(token, key=settings.SECRET_KEY, salt=WAITER_SALT, max_age=60 * 60 * 24)
        return data
    except Exception:
        return None


def _authenticate_request(request):
    auth = request.headers.get("Authorization", "")
    token = ""
    if auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1].strip()
    else:
        token = request.headers.get("X-Waiter-Token", "")
    if not token:
        return None
    data = _load_token(token)
    if not data:
        return None
    try:
        staff = StaffMember.objects.get(id=data.get("staff_id"))
        return staff
    except StaffMember.DoesNotExist:
        return None


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Waiter login using restaurant_id and pin. Returns a signed token."""
    restaurant_id = request.data.get("restaurant_id")
    pin = request.data.get("pin")
    if not restaurant_id or not pin:
        return Response({"detail": "restaurant_id and pin required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        staff = StaffMember.objects.get(restaurant_id=restaurant_id, pin=str(pin), status="Active")
    except StaffMember.DoesNotExist:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    token = _make_token(staff.id)
    return Response({"token": token, "staff": {"id": str(staff.id), "first_name": staff.first_name, "last_name": staff.last_name, "role": staff.role}})


@api_view(["GET"])
@permission_classes([AllowAny])
def menu_list(request):
    """Return menu items for the waiter restaurant. Requires waiter token."""
    staff = _authenticate_request(request)
    if not staff:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    items = MenuItem.objects.filter(restaurant_id=staff.restaurant_id)
    data = [
        {
            "id": str(i.id),
            "name": i.name,
            "price": float(i.price),
            "quantity": int(i.quantity),
        }
        for i in items
    ]
    return Response({"results": data})


@api_view(["POST"])
@permission_classes([AllowAny])
def take_order(request):
    """Create an order on behalf of the waiter. Expects items list [{menu_item_id, quantity}]."""
    staff = _authenticate_request(request)
    if not staff:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    items = request.data.get("items") or []
    if not items:
        return Response({"detail": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)

    payload = {
        "external_id": None,
        "restaurant_id": staff.restaurant_id,
        "branch_id": staff.assigned_shift or None,
        "customer_id": None,
        "status": "pending",
        "source": "waiter",
        "delivery_type": "dinein",
        "delivery_address": None,
        "items": [],
    }

    for it in items:
        payload["items"].append({
            "menu_item_id": it.get("menu_item_id"),
            "name": it.get("name"),
            "quantity": int(it.get("quantity", 1)),
            "unit_price": it.get("unit_price") or 0,
        })

    try:
        order = order_services.create_order(payload, user=None)
        return Response({"order_id": str(order.id)})
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def cancel_item(request, order_id: str):
    """Cancel an order item: supply order_item_id."""
    staff = _authenticate_request(request)
    if not staff:
        return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    order_item_id = request.data.get("order_item_id")
    if not order_item_id:
        return Response({"detail": "order_item_id required"}, status=status.HTTP_400_BAD_REQUEST)

    from apps.orders.models import OrderItem

    try:
        oi = OrderItem.objects.get(id=order_item_id)
        oi.status = "cancelled"
        oi.save()
        return Response({"success": True})
    except OrderItem.DoesNotExist:
        return Response({"detail": "Order item not found"}, status=status.HTTP_404_NOT_FOUND)
