from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import date
from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from .models import StaffMember, Role, Shift, MenuItem, MenuCategory
from authentication.models import Restaurant


def _serialize_restaurant(r):
    return {
        "id": str(r.id),
        "name": r.name,
        "email": r.email,
        "cuisine": ["Multi-Cuisine"],
        "rating": 4.5,
        "delivery_time_min": 30,
        "location": r.address if r.address else "City Center",
        "min_order_amount": 100,
        "offer_text": "Welcome offer",
        "is_open": r.is_active,
        "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    }


MOCK_MENUS = {
    "r1": [
        {
            "id": "m1_1",
            "name": "Zinger Burger",
            "description": "Signature crispy chicken breast patty, layered with fresh lettuce and creamy mayonnaise inside a toasted sesame bun.",
            "price": 189,
            "discount_price": 169,
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
            "category": "Burgers & Wraps",
            "tags": ["Non-Veg", "Bestseller"],
            "quantity": 15,
            "low_stock_threshold": 5,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m1_2",
            "name": "Veg Zinger",
            "description": "Crispy vegetable patty, topped with fresh lettuce and delicious burger sauce in a soft bun.",
            "price": 149,
            "discount_price": 129,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=500&q=80",
            "category": "Burgers & Wraps",
            "tags": ["Veg", "New"],
            "quantity": 4,
            "low_stock_threshold": 5,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m1_3",
            "name": "4 Pc Hot & Crispy Chicken",
            "description": "Four pieces of signature golden-brown, crispy fried chicken cooked to tender perfection.",
            "price": 429,
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
            "category": "Chicken Buckets",
            "tags": ["Non-Veg", "Bestseller"],
            "quantity": 2,
            "low_stock_threshold": 3,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m1_4",
            "name": "Large French Fries",
            "description": "Crispy golden premium fries lightly sprinkled with salt. Served hot.",
            "price": 119,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
            "category": "Sides",
            "tags": ["Veg"],
            "quantity": 0,
            "low_stock_threshold": 5,
            "status": "Out of Stock",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m1_5",
            "name": "Pepsi 500ml",
            "description": "Chilled carbonated soft drink to accompany your meal.",
            "price": 60,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
            "category": "Beverages",
            "tags": ["Veg", "New"],
            "quantity": 50,
            "low_stock_threshold": 10,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        }
    ],
    "r2": [
        {
            "id": "m2_1",
            "name": "Classic Margherita Pizza",
            "description": "A classic delight loaded with extra real mozzarella cheese on an authentic herb-infused crust.",
            "price": 239,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80",
            "category": "Veg Pizzas",
            "tags": ["Veg", "Bestseller"],
            "quantity": 12,
            "low_stock_threshold": 5,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m2_2",
            "name": "Peppy Paneer Pizza",
            "description": "Flavorful paneer cubes, crisp capsicum, and spicy red paprika, topped with gooey mozzarella cheese.",
            "price": 399,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
            "category": "Veg Pizzas",
            "tags": ["Veg"],
            "quantity": 8,
            "low_stock_threshold": 3,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m2_3",
            "name": "Pepper Barbecue Chicken Pizza",
            "description": "Juicy pepper barbecue chicken shreds paired with onions and cheese for a smokey flavor.",
            "price": 449,
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
            "category": "Non-Veg Pizzas",
            "tags": ["Non-Veg", "Bestseller"],
            "quantity": 6,
            "low_stock_threshold": 5,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m2_4",
            "name": "Garlic Breadsticks",
            "description": "Freshly baked garlic butter seasoned breadsticks. Best served with cheese dip.",
            "price": 139,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=500&q=80",
            "category": "Sides",
            "tags": ["Veg", "New"],
            "quantity": 10,
            "low_stock_threshold": 4,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        }
    ],
    "r3": [
        {
            "id": "m3_1",
            "name": "Special Chicken Dum Biryani",
            "description": "Richly spiced chicken slow-cooked layered with premium long grain basmati rice, saffron, and aromatic spices.",
            "price": 289,
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
            "category": "Biryani",
            "tags": ["Non-Veg", "Bestseller"],
            "quantity": 25,
            "low_stock_threshold": 5,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m3_2",
            "name": "Paneer Tikka Biryani",
            "description": "Soft paneer cubes marinated in tikka spices, slow-cooked in dum style with fragrant basmati rice.",
            "price": 249,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80",
            "category": "Biryani",
            "tags": ["Veg"],
            "quantity": 0,
            "low_stock_threshold": 5,
            "status": "Out of Stock",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m3_3",
            "name": "Double Ka Meetha",
            "description": "Classic Hyderabadi bread pudding dessert, prepared with fried bread slices soaked in saffron milk and dry fruits.",
            "price": 99,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=80",
            "category": "Desserts",
            "tags": ["Veg", "New"],
            "quantity": 18,
            "low_stock_threshold": 5,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        }
    ],
    "r4": [
        {
            "id": "m4_1",
            "name": "Overload Brownie",
            "description": "Dense, fudgy chocolate brownie loaded with chunks of premium dark chocolate and chocolate chips. Best served warm.",
            "price": 120,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80",
            "category": "Brownies",
            "tags": ["Veg", "Bestseller"],
            "quantity": 8,
            "low_stock_threshold": 3,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        },
        {
            "id": "m4_2",
            "name": "Red Velvet Cake Pastry",
            "description": "Delicate red velvet sponge layers filled and frosted with our signature smooth cream cheese icing.",
            "price": 140,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1586985289688-ca9cf4993cc0?auto=format&fit=crop&w=500&q=80",
            "category": "Pastries",
            "tags": ["Veg", "New"],
            "quantity": 10,
            "low_stock_threshold": 4,
            "status": "Active",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "available_hours": {"from": "11:00", "to": "23:00"},
            "created_at": "2026-05-27T09:00:00Z",
            "updated_at": "2026-05-27T09:00:00Z",
        }
    ]
}

MOCK_CATEGORIES = {
    "r1": [
        {"id": "c1", "name": "Burgers & Wraps"},
        {"id": "c2", "name": "Chicken Buckets"},
        {"id": "c3", "name": "Sides"},
        {"id": "c4", "name": "Beverages"},
    ],
    "r2": [
        {"id": "c5", "name": "Veg Pizzas"},
        {"id": "c6", "name": "Non-Veg Pizzas"},
        {"id": "c7", "name": "Sides"},
    ],
    "r3": [
        {"id": "c8", "name": "Biryani"},
        {"id": "c9", "name": "Desserts"},
    ],
    "r4": [
        {"id": "c10", "name": "Brownies"},
        {"id": "c11", "name": "Pastries"},
    ]
}

@api_view(["GET"])
@permission_classes([AllowAny])
def restaurants_list(request):
    """
    Public restaurant listing API for the food ordering dashboard.
    Supports basic search/filter/sort/pagination via query params.
    """
    q = (request.query_params.get("q") or "").strip().lower()
    cuisine = (request.query_params.get("cuisine") or "").strip().lower()
    min_rating = request.query_params.get("min_rating")
    sort = (request.query_params.get("sort") or "rating_desc").strip()

    try:
        page = max(int(request.query_params.get("page", 1)), 1)
    except ValueError:
        page = 1
    try:
        page_size = min(max(int(request.query_params.get("page_size", 12)), 1), 48)
    except ValueError:
        page_size = 12

    def matches(item):
        if q and q not in item["name"].lower() and not any(q in c.lower() for c in item["cuisine"]):
            return False
        if cuisine and not any(cuisine in c.lower() for c in item["cuisine"]):
            return False
        if min_rating:
            try:
                if float(item["rating"]) < float(min_rating):
                    return False
            except ValueError:
                pass
        return True

    db_restaurants = Restaurant.objects.filter(is_active=True)
    all_restaurants = [_serialize_restaurant(r) for r in db_restaurants]

    filtered = [r for r in all_restaurants if matches(r)]

    if sort == "rating_desc":
        filtered.sort(key=lambda r: r["rating"], reverse=True)
    elif sort == "delivery_asc":
        filtered.sort(key=lambda r: r["delivery_time_min"])
    elif sort == "name_asc":
        filtered.sort(key=lambda r: r["name"].lower())

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    results = filtered[start:end]

    return Response(
        {
            "results": results,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
        }
    )

@api_view(["GET"])
@permission_classes([AllowAny])
def restaurant_detail(request, pk):
    """
    Get metadata for a single restaurant.
    """
    try:
        r = Restaurant.objects.get(id=pk, is_active=True)
        return Response(_serialize_restaurant(r))
    except (Restaurant.DoesNotExist, ValueError):
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)


def serialize_menu_item(item):
    return {
        "id": str(item.id),
        "name": item.name,
        "description": item.description,
        "price": float(item.price),
        "discount_price": float(item.discount_price) if item.discount_price is not None else None,
        "is_veg": item.is_veg,
        "image_url": item.image_url,
        "category": item.category or "General",
        "tags": item.tags or [],
        "quantity": item.quantity,
        "low_stock_threshold": item.low_stock_threshold,
        "status": item.status,
        "available_days": item.available_days or [],
        "available_hours": item.available_hours or None,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }


def serialize_category(category):
    return {
        "id": str(category.id),
        "name": category.name,
    }


def seed_menu_data_if_needed(restaurant_id):
    if MenuItem.objects.filter(restaurant_id=restaurant_id).exists():
        return

    seed_items = MOCK_MENUS.get(restaurant_id)
    if not seed_items:
        return

    with transaction.atomic():
        if MenuItem.objects.filter(restaurant_id=restaurant_id).exists():
            return

        category_cache = {}
        for seed_item in seed_items:
            category_name = seed_item.get("category") or "General"
            if category_name not in category_cache:
                category_cache[category_name], _ = MenuCategory.objects.get_or_create(
                    restaurant_id=restaurant_id,
                    name=category_name,
                )

            quantity = int(seed_item.get("quantity", 0))
            status_value = seed_item.get("status") or "Active"
            if quantity <= 0:
                status_value = "Out of Stock"

            MenuItem.objects.create(
                restaurant_id=restaurant_id,
                name=seed_item.get("name", "").strip(),
                description=seed_item.get("description", "").strip(),
                category=category_name,
                is_veg=bool(seed_item.get("is_veg", True)),
                tags=seed_item.get("tags", []),
                price=Decimal(str(seed_item.get("price", 0))),
                discount_price=(
                    Decimal(str(seed_item["discount_price"]))
                    if seed_item.get("discount_price") is not None
                    else None
                ),
                quantity=quantity,
                low_stock_threshold=int(seed_item.get("low_stock_threshold", 5)),
                status=status_value,
                image_url=seed_item.get("image_url") or None,
                available_days=seed_item.get("available_days", []),
                available_hours=seed_item.get("available_hours") or None,
            )

@api_view(["GET"])
@permission_classes([AllowAny])
def restaurant_menu(request, pk):
    """
    Get menu items for a single restaurant.
    """
    seed_menu_data_if_needed(pk)
    menu = MenuItem.objects.filter(restaurant_id=pk).order_by("id")
    return Response([serialize_menu_item(item) for item in menu])

@api_view(["POST"])
@permission_classes([AllowAny])
def toggle_favorite(request, pk):
    """
    Simulated restaurant favorite toggle endpoint.
    Accepts {"fail": true} in request body to simulate API failures for rollback testing.
    """
    try:
        r = Restaurant.objects.get(id=pk, is_active=True)
    except (Restaurant.DoesNotExist, ValueError):
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if we should simulate an error
    should_fail = request.data.get("fail", False)
    if should_fail:
        return Response(
            {"detail": "Database connection error. Failed to save favorite."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    is_favorite = request.data.get("is_favorite", False)
    return Response({
        "success": True,
        "id": pk,
        "is_favorite": is_favorite
    })

# ─── New Restaurant Admin Menu Management APIs ───

@api_view(["GET", "POST", "DELETE"])
@permission_classes([AllowAny])
def restaurant_menu_list(request, pk):
    """
    Manage list operations for a restaurant's menu:
    - GET: Filter, search, sort, and paginate menu items.
    - POST: Create a new menu item.
    - DELETE: Bulk delete menu items.
    """
    seed_menu_data_if_needed(pk)
    menu_queryset = MenuItem.objects.filter(restaurant_id=pk)

    if request.method == "GET":
        q = (request.query_params.get("q") or "").strip().lower()
        category = (request.query_params.get("category") or "").strip()
        status_filter = (request.query_params.get("status") or "").strip()
        sort = (request.query_params.get("sort") or "name_asc").strip()

        try:
            page = max(int(request.query_params.get("page", 1)), 1)
        except ValueError:
            page = 1
        try:
            page_size = min(max(int(request.query_params.get("page_size", 10)), 1), 100)
        except ValueError:
            page_size = 10

        filtered = []
        for item in menu_queryset:
            item_data = serialize_menu_item(item)

            # Search filter
            if q:
                in_name = q in item_data.get("name", "").lower()
                in_desc = q in item_data.get("description", "").lower()
                in_tags = any(q in t.lower() for t in item_data.get("tags", []))
                in_cat = q in item_data.get("category", "").lower()
                if not (in_name or in_desc or in_tags or in_cat):
                    continue

            # Category filter
            if category and item_data.get("category") != category:
                continue

            # Status filter
            if status_filter and item_data.get("status") != status_filter:
                continue

            filtered.append(item_data)

        # Sorting
        if sort == "name_asc":
            filtered.sort(key=lambda x: x.get("name", "").lower())
        elif sort == "name_desc":
            filtered.sort(key=lambda x: x.get("name", "").lower(), reverse=True)
        elif sort == "price_asc":
            filtered.sort(key=lambda x: float(x.get("price", 0)))
        elif sort == "price_desc":
            filtered.sort(key=lambda x: float(x.get("price", 0)), reverse=True)
        elif sort == "updated_desc":
            filtered.sort(key=lambda x: x.get("updated_at", ""), reverse=True)

        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        results = filtered[start:end]

        return Response({
            "results": results,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total
        })

    elif request.method == "POST":
        data = request.data
        if data.get("fail"):
            return Response({"detail": "Simulated error during creation"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        name = data.get("name", "").strip()
        price = data.get("price")
        quantity = data.get("quantity", 0)

        if not name:
            return Response({"detail": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if price is None:
            return Response({"detail": "Price is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            price_value = Decimal(str(price))
            quantity_value = int(quantity)
            low_stock_threshold = int(data.get("low_stock_threshold", 5))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid numeric value supplied"}, status=status.HTTP_400_BAD_REQUEST)

        category_name = (data.get("category") or "General").strip() or "General"
        category_name = MenuCategory.objects.filter(restaurant_id=pk, name__iexact=category_name).values_list("name", flat=True).first() or category_name
        MenuCategory.objects.get_or_create(restaurant_id=pk, name=category_name)

        # Compute initial status based on quantity
        computed_status = "Out of Stock" if quantity_value <= 0 else (data.get("status") or "Active")

        new_item = MenuItem.objects.create(
            restaurant_id=pk,
            name=name,
            description=data.get("description", "").strip(),
            price=price_value,
            discount_price=(Decimal(str(data["discount_price"])) if data.get("discount_price") is not None else None),
            is_veg=bool(data.get("is_veg", True)),
            image_url=data.get("image_url") or None,
            category=category_name,
            tags=data.get("tags", []),
            quantity=quantity_value,
            low_stock_threshold=low_stock_threshold,
            status=computed_status,
            available_days=data.get("available_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
            available_hours=data.get("available_hours") or {"from": "00:00", "to": "23:59"},
        )
        return Response(serialize_menu_item(new_item), status=status.HTTP_201_CREATED)

    elif request.method == "DELETE":
        # Bulk Deletion
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No ids provided for deletion"}, status=status.HTTP_400_BAD_REQUEST)

        # Support simulated failure for rollback testing
        if request.data.get("fail"):
            return Response({"detail": "Simulated bulk deletion error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        deleted_count, _ = MenuItem.objects.filter(restaurant_id=pk, id__in=ids).delete()
        return Response({"success": True, "deleted_count": deleted_count})

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_menu_detail(request, pk, item_id):
    """
    Manage details for a single menu item:
    - GET: Retrieve a single menu item.
    - PATCH: Partial updates (e.g. inline quantity or status changes).
    - DELETE: Single item deletion.
    """
    seed_menu_data_if_needed(pk)
    item = MenuItem.objects.filter(restaurant_id=pk, id=item_id).first()
    if not item:
        return Response({"detail": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(serialize_menu_item(item))

    if request.method == "PATCH":
        data = request.data

        # Support simulated failure for rollback testing
        if data.get("fail") or request.query_params.get("fail"):
            return Response({"detail": "Simulated API failure for rollback verification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Update fields
        if "name" in data:
            item.name = data["name"]
        if "description" in data:
            item.description = data["description"]
        if "price" in data:
            item.price = Decimal(str(data["price"]))
        if "discount_price" in data:
            item.discount_price = Decimal(str(data["discount_price"])) if data["discount_price"] is not None else None
        if "is_veg" in data:
            item.is_veg = bool(data["is_veg"])
        if "image_url" in data:
            item.image_url = data["image_url"] or None
        if "category" in data:
            category_name = (data.get("category") or "General").strip() or "General"
            category_name = MenuCategory.objects.filter(restaurant_id=pk, name__iexact=category_name).values_list("name", flat=True).first() or category_name
            MenuCategory.objects.get_or_create(restaurant_id=pk, name=category_name)
            item.category = category_name
        if "tags" in data:
            item.tags = data["tags"] or []
        if "low_stock_threshold" in data:
            item.low_stock_threshold = int(data["low_stock_threshold"])
        if "available_days" in data:
            item.available_days = data["available_days"] or []
        if "available_hours" in data:
            item.available_hours = data["available_hours"] or None

        old_quantity = item.quantity
        if "quantity" in data:
            new_quantity = int(data["quantity"])
            item.quantity = new_quantity
            if new_quantity <= 0:
                item.status = "Out of Stock"
            elif old_quantity <= 0 and new_quantity > 0 and item.status == "Out of Stock":
                item.status = "Active"

        if "status" in data:
            item.status = data["status"]

        item.save()
        return Response(serialize_menu_item(item))

    if request.method == "DELETE":
        # Support simulated failure for rollback verification
        if request.query_params.get("fail") or request.data.get("fail"):
            return Response({"detail": "Simulated deletion failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        item.delete()
        return Response({"success": True})

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_categories_list(request, pk):
    """
    Manage categories list:
    - GET: Retrieve categories list.
    - POST: Create a category.
    """
    seed_menu_data_if_needed(pk)
    categories = MenuCategory.objects.filter(restaurant_id=pk).order_by("name")

    if request.method == "GET":
        return Response([serialize_category(category) for category in categories])

    elif request.method == "POST":
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"detail": "Category name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already exists
        if MenuCategory.objects.filter(restaurant_id=pk, name__iexact=name).exists():
            return Response({"detail": "Category already exists"}, status=status.HTTP_400_BAD_REQUEST)

        new_cat = MenuCategory.objects.create(restaurant_id=pk, name=name)
        return Response(serialize_category(new_cat), status=status.HTTP_201_CREATED)

@api_view(["PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_category_detail(request, pk, cat_id):
    """
    Manage category operations:
    - PATCH: Rename a category and update all items mapped to this category.
    - DELETE: Delete a category.
    """
    category = MenuCategory.objects.filter(restaurant_id=pk, id=cat_id).first()
    if not category:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"detail": "Category name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if MenuCategory.objects.filter(restaurant_id=pk, name__iexact=name).exclude(id=category.id).exists():
            return Response({"detail": "Category already exists"}, status=status.HTTP_400_BAD_REQUEST)

        old_name = category.name
        category.name = name
        category.save()

        # Propagate renaming to menu items to avoid broken references
        MenuItem.objects.filter(restaurant_id=pk, category=old_name).update(category=name)

        return Response(serialize_category(category))

    elif request.method == "DELETE":
        MenuCategory.objects.get_or_create(restaurant_id=pk, name="General")
        MenuItem.objects.filter(restaurant_id=pk, category=category.name).update(category="General")
        category.delete()
        return Response({"success": True})

@api_view(["POST"])
@permission_classes([AllowAny])
def upload_image(request):
    """
    Receive an uploaded file, store it locally in media root, and return its media URL path.
    """
    uploaded_file = request.FILES.get("image") or request.FILES.get("file")
    if not uploaded_file:
        return Response({"detail": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate size (2MB)
    if uploaded_file.size > 2 * 1024 * 1024:
        return Response({"detail": "File size exceeds 2MB limit"}, status=status.HTTP_400_BAD_REQUEST)

    # Save to media/menu/
    filename = f"{uuid.uuid4().hex[:12]}_{uploaded_file.name}"
    filepath = os.path.join("menu", filename)
    saved_path = default_storage.save(filepath, ContentFile(uploaded_file.read()))

    url_path = f"/media/{saved_path}"
    return Response({"url": url_path}, status=status.HTTP_201_CREATED)

# --- TABLE MANAGEMENT MOCK SERVICES & VIEWS ---

MOCK_TABLES = {
    "r1": [
        {
            "id": "t1",
            "number": 1,
            "capacity": 4,
            "section": "Indoor",
            "notes": "Near window",
            "status": "Available",
            "waiter": "",
            "seated_at": "",
        },
        {
            "id": "t2",
            "number": 2,
            "capacity": 2,
            "section": "Outdoor",
            "notes": "Cozy corner",
            "status": "Occupied",
            "waiter": "Sarah Jenkins",
            "seated_at": "2026-05-27T15:00:00Z",
        },
        {
            "id": "t3",
            "number": 3,
            "capacity": 6,
            "section": "Indoor",
            "notes": "Large family table",
            "status": "Reserved",
            "waiter": "Michael Chang",
            "seated_at": "",
            "reserved_at": "2026-05-27T19:30:00Z",
        },
        {
            "id": "t4",
            "number": 4,
            "capacity": 4,
            "section": "Bar",
            "notes": "High chairs",
            "status": "Cleaning",
            "waiter": "",
            "seated_at": "",
        },
    ]
}

MOCK_TABLE_ORDERS = {
    "r1": {
        "t2": [
            {
                "id": "o1",
                "item_id": "m1_1",
                "item_name": "Zinger Burger",
                "quantity": 2,
                "notes": "Extra crispy, no mayo",
                "price": 189,
                "status": "Served",
            },
            {
                "id": "o2",
                "item_id": "m1_2",
                "item_name": "Veg Zinger",
                "quantity": 1,
                "notes": "",
                "price": 149,
                "status": "Preparing",
            }
        ]
    }
}

def broadcast_table_update(restaurant_id, payload):
    """
    Utility to broadcast table status or order status to WebSocket consumers.
    """
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"restaurant_{restaurant_id}_tables",
                {
                    "type": "table_broadcast",
                    "message": payload
                }
            )
    except Exception as e:
        print(f"Failed to broadcast websocket event: {str(e)}")

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_tables_list(request, pk):
    """
    List tables for a restaurant, or create a new table.
    """
    if pk not in MOCK_TABLES:
        MOCK_TABLES[pk] = []
    
    tables = MOCK_TABLES[pk]

    if request.method == "GET":
        return Response(tables)

    elif request.method == "POST":
        number = request.data.get("number")
        capacity = request.data.get("capacity")
        section = request.data.get("section", "Indoor").strip() or "Indoor"
        notes = request.data.get("notes", "").strip()

        if number is None or capacity is None:
            return Response({"detail": "Table number and seating capacity are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            number = int(number)
            capacity = int(capacity)
        except ValueError:
            return Response({"detail": "Number and capacity must be valid integers"}, status=status.HTTP_400_BAD_REQUEST)

        if capacity <= 0 or capacity > 20:
            return Response({"detail": "Capacity must be between 1 and 20"}, status=status.HTTP_400_BAD_REQUEST)

        # Check for table number uniqueness
        if any(t["number"] == number for t in tables):
            return Response({"detail": "Table number already exists"}, status=status.HTTP_400_BAD_REQUEST)

        new_table = {
            "id": f"t_{uuid.uuid4().hex[:6]}",
            "number": number,
            "capacity": capacity,
            "section": section,
            "notes": notes,
            "status": "Available",
            "waiter": "",
            "seated_at": "",
        }
        tables.append(new_table)
        
        # Broadcast creation
        broadcast_table_update(pk, {
            "type": "table_status_update",
            "table_id": new_table["id"],
            "status": "Available",
            "waiter": "",
            "seated_at": "",
            "table": new_table
        })

        return Response(new_table, status=status.HTTP_201_CREATED)

@api_view(["PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_table_detail(request, pk, table_id):
    """
    Update a table's status or delete a table.
    """
    if pk not in MOCK_TABLES:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    tables = MOCK_TABLES[pk]
    table = next((t for t in tables if t["id"] == table_id), None)
    if not table:
        return Response({"detail": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        # Support simulated failure for rollback testing
        if request.query_params.get("fail") or request.data.get("fail"):
            return Response({"detail": "Simulated connection error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        new_status = request.data.get("status")
        waiter = request.data.get("waiter")
        notes = request.data.get("notes")

        if new_status:
            allowed_statuses = ["Available", "Occupied", "Reserved", "Cleaning"]
            if new_status not in allowed_statuses:
                return Response({"detail": f"Invalid status. Must be one of {allowed_statuses}"}, status=status.HTTP_400_BAD_REQUEST)
            table["status"] = new_status
            
            # Clear or set seated_at / waiter based on status
            if new_status == "Available":
                table["waiter"] = ""
                table["seated_at"] = ""
                # Clear active orders if table becomes available
                if pk in MOCK_TABLE_ORDERS and table_id in MOCK_TABLE_ORDERS[pk]:
                    MOCK_TABLE_ORDERS[pk][table_id] = []
            elif new_status == "Occupied":
                from django.utils import timezone
                table["seated_at"] = timezone.now().isoformat()
                if waiter is not None:
                    table["waiter"] = waiter
            elif new_status == "Reserved":
                table["seated_at"] = ""
                if waiter is not None:
                    table["waiter"] = waiter

        if waiter is not None and table["status"] in ["Occupied", "Reserved"]:
            table["waiter"] = waiter

        if notes is not None:
            table["notes"] = notes

        # Broadcast update
        broadcast_table_update(pk, {
            "type": "table_status_update",
            "table_id": table_id,
            "status": table["status"],
            "waiter": table["waiter"],
            "seated_at": table.get("seated_at", ""),
            "table": table
        })

        return Response(table)

    elif request.method == "DELETE":
        if table["status"] in ["Occupied", "Reserved"]:
            return Response({"detail": "Cannot remove an occupied or reserved table"}, status=status.HTTP_400_BAD_REQUEST)

        MOCK_TABLES[pk] = [t for t in tables if t["id"] != table_id]
        
        # Clear orders
        if pk in MOCK_TABLE_ORDERS and table_id in MOCK_TABLE_ORDERS[pk]:
            del MOCK_TABLE_ORDERS[pk][table_id]

        # Broadcast delete
        broadcast_table_update(pk, {
            "type": "table_deleted",
            "table_id": table_id
        })

        return Response({"success": True})

@api_view(["GET", "POST", "PATCH"])
@permission_classes([AllowAny])
def restaurant_table_orders(request, pk, table_id):
    """
    Manage orders for a specific table:
    - GET: Retrieve current orders.
    - POST: Add a new item to the order.
    - PATCH: Mark all order items as served.
    """
    if pk not in MOCK_TABLES:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    tables = MOCK_TABLES[pk]
    table = next((t for t in tables if t["id"] == table_id), None)
    if not table:
        return Response({"detail": "Table not found"}, status=status.HTTP_404_NOT_FOUND)

    if pk not in MOCK_TABLE_ORDERS:
        MOCK_TABLE_ORDERS[pk] = {}

    if table_id not in MOCK_TABLE_ORDERS[pk]:
        MOCK_TABLE_ORDERS[pk][table_id] = []

    order_items = MOCK_TABLE_ORDERS[pk][table_id]

    if request.method == "GET":
        return Response(order_items)

    elif request.method == "POST":
        item_id = request.data.get("item_id")
        quantity = request.data.get("quantity")
        notes = request.data.get("notes", "").strip()

        if not item_id or quantity is None:
            return Response({"detail": "item_id and quantity are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"detail": "Quantity must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({"detail": "Quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve the menu item from the persisted menu table
        menu_item = MenuItem.objects.filter(restaurant_id=pk, id=item_id).first()
        if not menu_item:
            return Response({"detail": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)

        new_order_item = {
            "id": f"o_{uuid.uuid4().hex[:6]}",
            "item_id": item_id,
            "item_name": menu_item.name,
            "quantity": quantity,
            "notes": notes,
            "price": float(menu_item.discount_price) if menu_item.discount_price is not None else float(menu_item.price),
            "status": "Pending",
        }
        order_items.append(new_order_item)

        # Broadcast update
        broadcast_table_update(pk, {
            "type": "table_order_update",
            "table_id": table_id,
            "order_item_id": new_order_item["id"],
            "status": "Pending",
            "order_item": new_order_item
        })

        return Response(new_order_item, status=status.HTTP_201_CREATED)

    elif request.method == "PATCH":
        # Mark all as served
        new_status = request.data.get("status")
        if new_status != "Served":
            return Response({"detail": "Only status 'Served' is supported for bulk updates"}, status=status.HTTP_400_BAD_REQUEST)

        for item in order_items:
            item["status"] = "Served"

        # Broadcast update
        broadcast_table_update(pk, {
            "type": "table_orders_bulk_update",
            "table_id": table_id,
            "status": "Served",
            "order_items": order_items
        })

        return Response({"success": True})

@api_view(["PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_table_order_detail(request, pk, table_id, order_id):
    """
    Manage individual order items:
    - PATCH: Update status (Pending -> Preparing -> Ready -> Served) with transition checks.
    - DELETE: Remove order item if status is Pending.
    """
    if pk not in MOCK_TABLE_ORDERS or table_id not in MOCK_TABLE_ORDERS[pk]:
        return Response({"detail": "Table orders not found"}, status=status.HTTP_404_NOT_FOUND)

    order_items = MOCK_TABLE_ORDERS[pk][table_id]
    order_item = next((item for item in order_items if item["id"] == order_id), None)
    if not order_item:
        return Response({"detail": "Order item not found"}, status=status.HTTP_404_NOT_FOUND)

    STATUS_ORDER = {"Pending": 0, "Preparing": 1, "Ready": 2, "Served": 3}

    if request.method == "PATCH":
        # Support simulated failure for rollback testing
        if request.query_params.get("fail") or request.data.get("fail"):
            return Response({"detail": "Simulated status transition failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        new_status = request.data.get("status")
        if not new_status or new_status not in STATUS_ORDER:
            return Response({"detail": f"Invalid status. Must be one of {list(STATUS_ORDER.keys())}"}, status=status.HTTP_400_BAD_REQUEST)

        current_idx = STATUS_ORDER[order_item["status"]]
        new_idx = STATUS_ORDER[new_status]

        # Guard: Cannot revert Preparing -> Pending, or general backward moves
        if new_idx < current_idx:
            return Response({"detail": f"Cannot revert status from {order_item['status']} to {new_status}"}, status=status.HTTP_400_BAD_REQUEST)

        order_item["status"] = new_status

        # Broadcast update
        broadcast_table_update(pk, {
            "type": "table_order_update",
            "table_id": table_id,
            "order_item_id": order_id,
            "status": new_status,
            "order_item": order_item
        })

        return Response(order_item)

    elif request.method == "DELETE":
        if order_item["status"] != "Pending":
            return Response({"detail": "Cannot remove an order item that is already being prepared or served"}, status=status.HTTP_400_BAD_REQUEST)

        MOCK_TABLE_ORDERS[pk][table_id] = [item for item in order_items if item["id"] != order_id]

        # Broadcast delete
        broadcast_table_update(pk, {
            "type": "table_order_deleted",
            "table_id": table_id,
            "order_item_id": order_id
        })

        return Response({"success": True})

@api_view(["GET"])
@permission_classes([AllowAny])
def restaurant_table_bill(request, pk, table_id):
    """
    Get current computed bill for the table: subtotal, tax (e.g. 5%), total.
    """
    if pk not in MOCK_TABLE_ORDERS or table_id not in MOCK_TABLE_ORDERS[pk]:
        return Response({
            "subtotal": 0,
            "tax": 0,
            "total": 0,
            "items": []
        })

    order_items = MOCK_TABLE_ORDERS[pk][table_id]
    
    subtotal = sum(item["price"] * item["quantity"] for item in order_items)
    tax = round(subtotal * 0.05, 2)  # 5% GST/Tax
    total = round(subtotal + tax, 2)

    return Response({
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "items": order_items
    })


MOCK_SHIFTS = {
    "r1": [
        {"id": "sf1", "name": "Morning Shift", "start_time": "9:00 AM", "end_time": "5:00 PM", "break_duration": "45 min"},
        {"id": "sf2", "name": "Evening Shift", "start_time": "4:00 PM", "end_time": "12:00 AM", "break_duration": "45 min"},
        {"id": "sf3", "name": "Night Shift", "start_time": "11:00 PM", "end_time": "7:00 AM", "break_duration": "30 min"}
    ]
}

MOCK_ROLES = {
    "r1": [
        {"id": "r_1", "name": "Manager", "color": "blue"},
        {"id": "r_2", "name": "Waiter", "color": "success"},
        {"id": "r_3", "name": "Kitchen Staff", "color": "accent"},
        {"id": "r_4", "name": "Cashier", "color": "warning"},
    ]
}

MOCK_STAFF = {
    "r1": [
        {
            "id": "s1",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "email": "sarah.j@pinesphere.com",
            "phone": "+15551234567",
            "dob": "1995-08-22",
            "profile_photo": "",
            "role": "Waiter",
            "employment_type": "Full-time",
            "date_joined": "2024-03-10",
            "salary_rate": 18.50,
            "status": "Active",
            "assigned_shift": "sf1",
            "pin": "1111",
            "admin_access": False,
            "tables": ["2"],
            "recent_activity": [
                {"action": "Took order on Table 2", "time": "2:15 PM"},
                {"action": "Clocked in", "time": "9:02 AM"},
                {"action": "Served table 2", "time": "9:45 AM"}
            ],
            "performance": {
                "orders_today": 12,
                "orders_week": 65,
                "orders_month": 240,
                "avg_value": 42.50
            },
            "today_schedule": {
                "clock_in": "09:02 AM",
                "clock_out": "Still on shift",
                "total_hours": "7.2"
            }
        },
        {
            "id": "s2",
            "first_name": "Michael",
            "last_name": "Chang",
            "email": "m.chang@pinesphere.com",
            "phone": "+15559876543",
            "dob": "1992-11-05",
            "profile_photo": "",
            "role": "Waiter",
            "employment_type": "Full-time",
            "date_joined": "2023-06-15",
            "salary_rate": 19.00,
            "status": "Active",
            "assigned_shift": "sf2",
            "pin": "2222",
            "admin_access": False,
            "tables": ["3"],
            "recent_activity": [
                {"action": "Clocked in", "time": "4:05 PM"}
            ],
            "performance": {
                "orders_today": 4,
                "orders_week": 58,
                "orders_month": 210,
                "avg_value": 38.00
            },
            "today_schedule": {
                "clock_in": "04:05 PM",
                "clock_out": "Still on shift",
                "total_hours": "1.5"
            }
        },
        {
            "id": "s3",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@pinesphere.com",
            "phone": "+15555555555",
            "dob": "1990-01-01",
            "profile_photo": "",
            "role": "Manager",
            "employment_type": "Full-time",
            "date_joined": "2022-01-01",
            "salary_rate": 50.00,
            "status": "Active",
            "assigned_shift": "sf1",
            "pin": "3333",
            "admin_access": True,
            "tables": [],
            "recent_activity": [
                {"action": "Clocked in", "time": "8:55 AM"}
            ],
            "performance": {
                "orders_today": 0,
                "orders_week": 0,
                "orders_month": 0,
                "avg_value": 0.00
            },
            "today_schedule": {
                "clock_in": "08:55 AM",
                "clock_out": "Still on shift",
                "total_hours": "8.0"
            }
        },
        {
            "id": "s4",
            "first_name": "Emily",
            "last_name": "Stone",
            "email": "emily.stone@pinesphere.com",
            "phone": "+15554443333",
            "dob": "1997-04-18",
            "profile_photo": "",
            "role": "Kitchen Staff",
            "employment_type": "Part-time",
            "date_joined": "2024-05-01",
            "salary_rate": 16.00,
            "status": "On Leave",
            "assigned_shift": "sf2",
            "pin": "4444",
            "admin_access": False,
            "tables": [],
            "recent_activity": [],
            "performance": {
                "orders_today": 0,
                "orders_week": 0,
                "orders_month": 0,
                "avg_value": 0.00
            },
            "today_schedule": {
                "clock_in": "",
                "clock_out": "",
                "total_hours": "0.0"
            }
        }
    ]
}

def compute_staff_summary(pk):
    staff_list = MOCK_STAFF.get(pk, [])
    roles_list = MOCK_ROLES.get(pk, [])
    
    on_leave = sum(1 for s in staff_list if s.get("status") == "On Leave")
    inactive = sum(1 for s in staff_list if s.get("status") == "Inactive")
    
    # On Shift: Active and today clocked in, still on shift
    on_shift = sum(1 for s in staff_list if s.get("status") == "Active" and s.get("today_schedule", {}).get("clock_out") == "Still on shift")
    # Off shift: active but not clocked in / still on shift
    off_shift = sum(1 for s in staff_list if s.get("status") == "Active" and s.get("today_schedule", {}).get("clock_out") != "Still on shift")
    
    return {
        "total_staff": len(staff_list),
        "on_shift": on_shift,
        "off_shift": off_shift,
        "on_leave": on_leave,
        "total_roles": len(roles_list)
    }

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_staff_list(request, pk):
    if pk not in MOCK_STAFF:
        MOCK_STAFF[pk] = []
    if pk not in MOCK_ROLES:
        MOCK_ROLES[pk] = []
        
    staff_list = MOCK_STAFF[pk]
    
    if request.method == "GET":
        search = (request.query_params.get("search") or "").strip().lower()
        role_filter = (request.query_params.get("role") or "").strip()
        status_filter = (request.query_params.get("status") or "").strip()
        shift_filter = (request.query_params.get("shift") or "").strip() # All, On Shift, Off Shift
        sort = (request.query_params.get("sort") or "name_asc").strip()
        
        try:
            page = max(int(request.query_params.get("page", 1)), 1)
        except ValueError:
            page = 1
        try:
            page_size = min(max(int(request.query_params.get("page_size", 10)), 1), 100)
        except ValueError:
            page_size = 10
            
        filtered = []
        for s in staff_list:
            # Search
            if search:
                fullName = f"{s.get('first_name', '')} {s.get('last_name', '')}".lower()
                email = s.get("email", "").lower()
                phone = s.get("phone", "").lower()
                role = s.get("role", "").lower()
                if search not in fullName and search not in email and search not in phone and search not in role:
                    continue
                    
            # Role
            if role_filter and s.get("role") != role_filter:
                continue
                
            # Status
            if status_filter and s.get("status") != status_filter:
                continue
                
            # Shift
            if shift_filter:
                is_on_shift = s.get("status") == "Active" and s.get("today_schedule", {}).get("clock_out") == "Still on shift"
                if shift_filter == "On Shift" and not is_on_shift:
                    continue
                if shift_filter == "Off Shift" and is_on_shift:
                    continue
                    
            filtered.append(s)
            
        # Sorting
        if sort == "name_asc":
            filtered.sort(key=lambda x: f"{x.get('first_name','') } {x.get('last_name','')}".lower())
        elif sort == "name_desc":
            filtered.sort(key=lambda x: f"{x.get('first_name','') } {x.get('last_name','')}".lower(), reverse=True)
        elif sort == "role":
            filtered.sort(key=lambda x: x.get("role", "").lower())
        elif sort == "date_joined_desc":
            filtered.sort(key=lambda x: x.get("date_joined", ""), reverse=True)
        elif sort == "date_joined_asc":
            filtered.sort(key=lambda x: x.get("date_joined", ""))
            
        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        results = filtered[start:end]
        
        summary = compute_staff_summary(pk)
        
        return Response({
            "results": results,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
            "summary": summary
        })
        
    elif request.method == "POST":
        data = request.data
        
        # Simulate error if requested
        if data.get("fail"):
            return Response({"detail": "Simulated error during creation"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Validation
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        dob = data.get("dob")
        pin = data.get("pin")
        
        if not first_name or not last_name or not email or not phone:
            return Response({"detail": "First name, last name, email, and phone number are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create record
        staff_id = f"s_{uuid.uuid4().hex[:8]}"
        
        # Shift details mapping (mock values)
        has_shift = data.get("assigned_shift")
        shift_detail = next((sf for sf in MOCK_SHIFTS.get(pk, []) if sf["id"] == has_shift), None)
        
        clock_in = ""
        clock_out = ""
        total_hours = "0.0"
        
        if data.get("status") == "Active" and shift_detail:
            clock_in = "09:00 AM"
            clock_out = "Still on shift"
            total_hours = "0.0"
            
        new_staff = {
            "id": staff_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "dob": dob,
            "profile_photo": data.get("profile_photo") or "",
            "role": data.get("role", "Waiter"),
            "employment_type": data.get("employment_type", "Full-time"),
            "date_joined": data.get("date_joined") or "2026-05-27",
            "salary_rate": float(data.get("salary_rate") or 0),
            "status": data.get("status") or "Active",
            "assigned_shift": data.get("assigned_shift") or "",
            "pin": pin,
            "admin_access": bool(data.get("admin_access", False)),
            "tables": [],
            "recent_activity": [
                {"action": "Added to staff directory", "time": "Just now"}
            ],
            "performance": {
                "orders_today": 0,
                "orders_week": 0,
                "orders_month": 0,
                "avg_value": 0.0
            },
            "today_schedule": {
                "clock_in": clock_in,
                "clock_out": clock_out,
                "total_hours": total_hours
            }
        }
        
        staff_list.append(new_staff)
        return Response(new_staff, status=status.HTTP_201_CREATED)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_staff_detail(request, pk, staff_id):
    if pk not in MOCK_STAFF:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)
        
    staff_list = MOCK_STAFF[pk]
    member = next((s for s in staff_list if s["id"] == staff_id), None)
    if not member:
        return Response({"detail": "Staff member not found"}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == "GET":
        return Response(member)
        
    elif request.method == "PUT":
        data = request.data
        # Simulate error
        if data.get("fail"):
            return Response({"detail": "Simulated edit failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Full update
        for field in ["first_name", "last_name", "phone", "dob", "profile_photo", "role", "employment_type", "date_joined", "assigned_shift", "pin", "admin_access", "status"]:
            if field in data:
                member[field] = data[field]
                
        if "salary_rate" in data:
            try:
                member["salary_rate"] = float(data["salary_rate"])
            except ValueError:
                pass
                
        # Update schedule mock values if status toggles
        if member["status"] == "On Leave" or member["status"] == "Inactive":
            member["today_schedule"]["clock_in"] = ""
            member["today_schedule"]["clock_out"] = ""
            member["today_schedule"]["total_hours"] = "0.0"
        elif member["status"] == "Active" and member["assigned_shift"] and not member["today_schedule"]["clock_in"]:
            member["today_schedule"]["clock_in"] = "09:00 AM"
            member["today_schedule"]["clock_out"] = "Still on shift"
            
        return Response(member)
        
    elif request.method == "PATCH":
        data = request.data
        if data.get("fail") or request.query_params.get("fail"):
            return Response({"detail": "Simulated patch failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        for field in ["status", "assigned_shift", "role", "admin_access"]:
            if field in data:
                member[field] = data[field]
                
        # Sync schedule
        if member["status"] == "On Leave" or member["status"] == "Inactive":
            member["today_schedule"]["clock_in"] = ""
            member["today_schedule"]["clock_out"] = ""
            member["today_schedule"]["total_hours"] = "0.0"
        elif member["status"] == "Active" and member["assigned_shift"] and not member["today_schedule"]["clock_in"]:
            member["today_schedule"]["clock_in"] = "09:00 AM"
            member["today_schedule"]["clock_out"] = "Still on shift"
            
        return Response(member)
        
    elif request.method == "DELETE":
        if request.query_params.get("fail") or request.data.get("fail"):
            return Response({"detail": "Simulated deletion failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Cannot delete a staff member who is currently clocked in (On Shift)
        is_on_shift = member.get("status") == "Active" and member.get("today_schedule", {}).get("clock_out") == "Still on shift"
        if is_on_shift:
            return Response({"detail": "Cannot remove staff while on shift"}, status=status.HTTP_400_BAD_REQUEST)
            
        MOCK_STAFF[pk] = [s for s in staff_list if s["id"] != staff_id]
        return Response({"success": True})

@api_view(["GET"])
@permission_classes([AllowAny])
def check_staff_email(request, pk):
    email = (request.query_params.get("email") or "").strip().lower()
    exclude_id = (request.query_params.get("exclude_id") or "").strip()
    if not email:
        return Response({"is_available": True})
    staff_list = MOCK_STAFF.get(pk, [])
    exists = any(s.get("email", "").lower() == email and s.get("id") != exclude_id for s in staff_list)
    return Response({"is_available": not exists})

@api_view(["GET"])
@permission_classes([AllowAny])
def check_staff_pin(request, pk):
    pin = (request.query_params.get("pin") or "").strip()
    exclude_id = (request.query_params.get("exclude_id") or "").strip()
    if not pin:
        return Response({"is_available": True})
    staff_list = MOCK_STAFF.get(pk, [])
    exists = any(s.get("pin") == pin and s.get("id") != exclude_id for s in staff_list)
    return Response({"is_available": not exists})

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_roles_list(request, pk):
    if pk not in MOCK_ROLES:
        MOCK_ROLES[pk] = []
    roles = MOCK_ROLES[pk]
    
    if request.method == "GET":
        staff_list = MOCK_STAFF.get(pk, [])
        enriched = []
        for r in roles:
            count = sum(1 for s in staff_list if s.get("role") == r["name"])
            enriched.append({
                "id": r["id"],
                "name": r["name"],
                "color": r["color"],
                "staff_count": count
            })
        return Response(enriched)
        
    elif request.method == "POST":
        name = request.data.get("name", "").strip()
        color = request.data.get("color", "default").strip()
        
        if not name:
            return Response({"detail": "Role name is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if any(r["name"].lower() == name.lower() for r in roles):
            return Response({"detail": "Role already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
        new_role = {
            "id": f"role_{uuid.uuid4().hex[:6]}",
            "name": name,
            "color": color
        }
        roles.append(new_role)
        return Response(new_role, status=status.HTTP_201_CREATED)

@api_view(["PUT", "DELETE"])
@permission_classes([AllowAny])
def restaurant_role_detail(request, pk, role_id):
    if pk not in MOCK_ROLES:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)
        
    roles = MOCK_ROLES[pk]
    role = next((r for r in roles if r["id"] == role_id), None)
    if not role:
        return Response({"detail": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == "PUT":
        name = request.data.get("name", "").strip()
        color = request.data.get("color", "").strip()
        
        if not name:
            return Response({"detail": "Role name is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if name.lower() != role["name"].lower() and any(r["name"].lower() == name.lower() for r in roles):
            return Response({"detail": "Role name already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
        old_name = role["name"]
        role["name"] = name
        if color:
            role["color"] = color
            
        # Propagate name change to staff
        staff_list = MOCK_STAFF.get(pk, [])
        for s in staff_list:
            if s.get("role") == old_name:
                s["role"] = name
                
        return Response(role)
        
    elif request.method == "DELETE":
        staff_list = MOCK_STAFF.get(pk, [])
        assigned = any(s.get("role") == role["name"] for s in staff_list)
        if assigned:
            return Response({"detail": "Cannot delete role assigned to staff members"}, status=status.HTTP_400_BAD_REQUEST)
            
        MOCK_ROLES[pk] = [r for r in roles if r["id"] != role_id]
        return Response({"success": True})

@api_view(["GET"])
@permission_classes([AllowAny])
def restaurant_shifts_list(request, pk):
    if pk not in MOCK_SHIFTS:
        MOCK_SHIFTS[pk] = []
    return Response(MOCK_SHIFTS[pk])




