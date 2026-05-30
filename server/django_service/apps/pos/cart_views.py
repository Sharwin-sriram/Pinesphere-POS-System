"""
Cart management API views
Handles user shopping cart operations
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import Cart, CartItem


def serialize_cart_item(item):
    """Convert CartItem model to API response format"""
    return {
        "id": str(item.id),
        "menu_item_id": item.menu_item_id,
        "name": item.name,
        "price": float(item.price),
        "quantity": item.quantity,
        "image": item.image,
        "restaurant": item.restaurant,
        "subtotal": float(item.get_subtotal()),
    }


def serialize_cart(cart):
    """Convert Cart model to API response format"""
    return {
        "id": str(cart.id),
        "user_id": cart.user.id,
        "restaurant_id": cart.restaurant_id,
        "items": [serialize_cart_item(item) for item in cart.items.all()],
        "item_count": cart.get_item_count(),
        "total": float(cart.get_total()),
        "created_at": cart.created_at.isoformat(),
        "updated_at": cart.updated_at.isoformat(),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """Get the current user's cart"""
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        # Create a new cart if it doesn't exist
        cart = Cart.objects.create(user=request.user)
    
    return Response(serialize_cart(cart))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add an item to the user's cart"""
    data = request.data
    
    # Validate required fields
    menu_item_id = data.get("menu_item_id")
    name = data.get("name", "").strip()
    price = data.get("price")
    
    if not menu_item_id or not name or price is None:
        return Response(
            {"detail": "menu_item_id, name, and price are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        price = Decimal(str(price))
    except (ValueError, TypeError):
        return Response(
            {"detail": "Invalid price format"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create cart
    cart, _ = Cart.objects.get_or_create(user=request.user)
    
    # Update restaurant_id if provided
    if data.get("restaurant"):
        cart.restaurant_id = data.get("restaurant")
        cart.save()
    
    # Add or update item in cart
    quantity = int(data.get("quantity", 1))
    if quantity <= 0:
        quantity = 1
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        menu_item_id=menu_item_id,
        defaults={
            "name": name,
            "price": price,
            "quantity": quantity,
            "image": data.get("image", ""),
            "restaurant": data.get("restaurant", ""),
        }
    )
    
    if not created:
        # Item already exists, increment quantity
        cart_item.quantity += quantity
        cart_item.save()
    
    return Response(serialize_cart(cart), status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """Update quantity of a cart item"""
    try:
        cart = Cart.objects.get(user=request.user)
        item = CartItem.objects.get(id=item_id, cart=cart)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response(
            {"detail": "Cart item not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    quantity = request.data.get("quantity")
    if quantity is None:
        return Response(
            {"detail": "quantity is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        return Response(
            {"detail": "Invalid quantity format"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if quantity <= 0:
        # Delete item if quantity is 0 or negative
        item.delete()
        return Response(serialize_cart(cart))
    
    item.quantity = quantity
    item.save()
    
    return Response(serialize_cart_item(item))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """Remove an item from the user's cart"""
    try:
        cart = Cart.objects.get(user=request.user)
        item = CartItem.objects.get(id=item_id, cart=cart)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response(
            {"detail": "Cart item not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    item.delete()
    return Response(serialize_cart(cart))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """Clear all items from the user's cart"""
    try:
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
    except Cart.DoesNotExist:
        pass
    
    # Get or create fresh cart
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return Response(serialize_cart(cart))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout_cart(request):
    """
    Checkout the cart (prepare for order creation)
    This endpoint validates the cart and prepares it for order processing
    """
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response(
            {"detail": "Cart is empty"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not cart.items.exists():
        return Response(
            {"detail": "Cart is empty"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Prepare checkout data
    checkout_data = {
        "user_id": cart.user.id,
        "restaurant_id": cart.restaurant_id,
        "items": [
            {
                "menu_item_id": item.menu_item_id,
                "name": item.name,
                "price": float(item.price),
                "quantity": item.quantity,
                "subtotal": float(item.get_subtotal()),
            }
            for item in cart.items.all()
        ],
        "subtotal": float(cart.get_total()),
        "tax": float(cart.get_total() * Decimal("0.05")),  # 5% tax
        "total": float(cart.get_total() * Decimal("1.05")),
    }
    
    return Response(checkout_data)
