from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


RESTAURANTS = [
    {
        "id": "r1",
        "name": "KFC - Kentucky Fried Chicken",
        "cuisine": ["American", "Fast Food", "Burgers"],
        "rating": 4.1,
        "delivery_time_min": 35,
        "location": "MG Road",
        "min_order_amount": 199,
        "offer_text": "Flat ₹50 OFF",
        "is_open": True,
        "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "r2",
        "name": "Domino's Pizza",
        "cuisine": ["Italian", "Pizzas", "Fast Food"],
        "rating": 4.3,
        "delivery_time_min": 28,
        "location": "Indiranagar",
        "min_order_amount": 299,
        "offer_text": "₹100 OFF above ₹499",
        "is_open": True,
        "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "r3",
        "name": "Local Biryani House",
        "cuisine": ["Mughlai", "Biryani", "North Indian"],
        "rating": 4.7,
        "delivery_time_min": 45,
        "location": "Koramangala",
        "min_order_amount": 249,
        "offer_text": "10% OFF up to ₹40",
        "is_open": False,
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "id": "r4",
        "name": "Theobroma",
        "cuisine": ["Desserts", "Bakery", "Cakes"],
        "rating": 4.8,
        "delivery_time_min": 20,
        "location": "HSR Layout",
        "min_order_amount": 149,
        "offer_text": "Free Delivery",
        "is_open": True,
        "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    },
]

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

    filtered = [r for r in RESTAURANTS if matches(r)]

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
    restaurant = next((r for r in RESTAURANTS if r["id"] == pk), None)
    if not restaurant:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response(restaurant)

@api_view(["GET"])
@permission_classes([AllowAny])
def restaurant_menu(request, pk):
    """
    Get menu items for a single restaurant.
    """
    menu = MOCK_MENUS.get(pk, [])
    return Response(menu)

@api_view(["POST"])
@permission_classes([AllowAny])
def toggle_favorite(request, pk):
    """
    Simulated restaurant favorite toggle endpoint.
    Accepts {"fail": true} in request body to simulate API failures for rollback testing.
    """
    restaurant = next((r for r in RESTAURANTS if r["id"] == pk), None)
    if not restaurant:
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
    if pk not in MOCK_MENUS:
        MOCK_MENUS[pk] = []

    menu_list = MOCK_MENUS[pk]

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

        # Filter items
        filtered = []
        for item in menu_list:
            # Search filter
            if q:
                in_name = q in item.get("name", "").lower()
                in_desc = q in item.get("description", "").lower()
                in_tags = any(q in t.lower() for t in item.get("tags", []))
                in_cat = q in item.get("category", "").lower()
                if not (in_name or in_desc or in_tags or in_cat):
                    continue

            # Category filter
            if category and item.get("category") != category:
                continue

            # Status filter
            if status_filter and item.get("status") != status_filter:
                continue

            filtered.append(item)

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
        name = data.get("name", "").strip()
        price = data.get("price")
        quantity = data.get("quantity", 0)

        if not name:
            return Response({"detail": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if price is None:
            return Response({"detail": "Price is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a unique ID
        item_id = f"m_{uuid.uuid4().hex[:8]}"

        # Compute initial status based on quantity
        computed_status = "Out of Stock" if int(quantity) <= 0 else (data.get("status") or "Active")

        new_item = {
            "id": item_id,
            "name": name,
            "description": data.get("description", "").strip(),
            "price": float(price),
            "discount_price": float(data["discount_price"]) if data.get("discount_price") else None,
            "is_veg": data.get("is_veg", True),
            "image_url": data.get("image_url") or None,
            "category": data.get("category", "General").strip(),
            "tags": data.get("tags", []),
            "quantity": int(quantity),
            "low_stock_threshold": int(data.get("low_stock_threshold", 5)),
            "status": computed_status,
            "available_days": data.get("available_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
            "available_hours": data.get("available_hours") or {"from": "00:00", "to": "23:59"},
            "created_at": "2026-05-27T15:00:00Z",
            "updated_at": "2026-05-27T15:00:00Z",
        }

        # Handle simulating error for failure test if requested
        if data.get("fail"):
            return Response({"detail": "Simulated error during creation"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        menu_list.append(new_item)
        return Response(new_item, status=status.HTTP_201_CREATED)

    elif request.method == "DELETE":
        # Bulk Deletion
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No ids provided for deletion"}, status=status.HTTP_400_BAD_REQUEST)

        # Support simulated failure for rollback testing
        if request.data.get("fail"):
            return Response({"detail": "Simulated bulk deletion error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        MOCK_MENUS[pk] = [item for item in menu_list if item["id"] not in ids]
        return Response({"success": True, "deleted_count": len(ids)})

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_menu_detail(request, pk, item_id):
    """
    Manage details for a single menu item:
    - GET: Retrieve a single menu item.
    - PATCH: Partial updates (e.g. inline quantity or status changes).
    - DELETE: Single item deletion.
    """
    if pk not in MOCK_MENUS:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    menu_list = MOCK_MENUS[pk]
    item = next((i for i in menu_list if i["id"] == item_id), None)
    if not item:
        return Response({"detail": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(item)

    elif request.method == "PATCH":
        data = request.data

        # Support simulated failure for rollback testing
        if data.get("fail") or request.query_params.get("fail"):
            return Response({"detail": "Simulated API failure for rollback verification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Update fields
        for field in ["name", "description", "price", "discount_price", "is_veg", "image_url", "category", "tags", "low_stock_threshold", "available_days", "available_hours"]:
            if field in data:
                if field == "price":
                    item["price"] = float(data["price"])
                elif field == "discount_price":
                    item["discount_price"] = float(data["discount_price"]) if data["discount_price"] is not None else None
                else:
                    item[field] = data[field]

        # Sync quantity & status updates
        if "quantity" in data:
            old_qty = item["quantity"]
            new_qty = int(data["quantity"])
            item["quantity"] = new_qty

            # Stepper Status rule:
            # - If quantity reaches 0, status automatically switches to "Out of Stock"
            # - If quantity rises from 0, status automatically switches to "Active"
            if new_qty <= 0:
                item["status"] = "Out of Stock"
            elif old_qty <= 0 and new_qty > 0 and item["status"] == "Out of Stock":
                item["status"] = "Active"

        if "status" in data:
            item["status"] = data["status"]

        item["updated_at"] = "2026-05-27T15:15:00Z"
        return Response(item)

    elif request.method == "DELETE":
        # Support simulated failure for rollback verification
        if request.query_params.get("fail") or request.data.get("fail"):
            return Response({"detail": "Simulated deletion failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        MOCK_MENUS[pk] = [i for i in menu_list if i["id"] != item_id]
        return Response({"success": True})

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def restaurant_categories_list(request, pk):
    """
    Manage categories list:
    - GET: Retrieve categories list.
    - POST: Create a category.
    """
    if pk not in MOCK_CATEGORIES:
        MOCK_CATEGORIES[pk] = []

    categories = MOCK_CATEGORIES[pk]

    if request.method == "GET":
        return Response(categories)

    elif request.method == "POST":
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"detail": "Category name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already exists
        if any(c["name"].lower() == name.lower() for c in categories):
            return Response({"detail": "Category already exists"}, status=status.HTTP_400_BAD_REQUEST)

        new_cat = {
            "id": f"c_{uuid.uuid4().hex[:6]}",
            "name": name
        }
        categories.append(new_cat)
        return Response(new_cat, status=status.HTTP_201_CREATED)

@api_view(["PATCH", "DELETE"])
@permission_classes([AllowAny])
def restaurant_category_detail(request, pk, cat_id):
    """
    Manage category operations:
    - PATCH: Rename a category and update all items in MOCK_MENUS mapped to this category.
    - DELETE: Delete a category.
    """
    if pk not in MOCK_CATEGORIES:
        return Response({"detail": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    categories = MOCK_CATEGORIES[pk]
    category = next((c for c in categories if c["id"] == cat_id), None)
    if not category:
        return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PATCH":
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"detail": "Category name is required"}, status=status.HTTP_400_BAD_REQUEST)

        old_name = category["name"]
        category["name"] = name

        # Propagate renaming to menu items to avoid broken references
        if pk in MOCK_MENUS:
            for item in MOCK_MENUS[pk]:
                if item.get("category") == old_name:
                    item["category"] = name

        return Response(category)

    elif request.method == "DELETE":
        MOCK_CATEGORIES[pk] = [c for c in categories if c["id"] != cat_id]
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

        # Lookup in MOCK_MENUS to get authentic name and price
        menu_items = MOCK_MENUS.get(pk, [])
        menu_item = next((item for item in menu_items if item["id"] == item_id), None)
        if not menu_item:
            return Response({"detail": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)

        new_order_item = {
            "id": f"o_{uuid.uuid4().hex[:6]}",
            "item_id": item_id,
            "item_name": menu_item["name"],
            "quantity": quantity,
            "notes": notes,
            "price": menu_item.get("discount_price") or menu_item["price"],
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



