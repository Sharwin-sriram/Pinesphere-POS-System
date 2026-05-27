from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

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
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
            "category": "Burgers & Wraps"
        },
        {
            "id": "m1_2",
            "name": "Veg Zinger",
            "description": "Crispy vegetable patty, topped with fresh lettuce and delicious burger sauce in a soft bun.",
            "price": 149,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=500&q=80",
            "category": "Burgers & Wraps"
        },
        {
            "id": "m1_3",
            "name": "4 Pc Hot & Crispy Chicken",
            "description": "Four pieces of signature golden-brown, crispy fried chicken cooked to tender perfection.",
            "price": 429,
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
            "category": "Chicken Buckets"
        },
        {
            "id": "m1_4",
            "name": "Large French Fries",
            "description": "Crispy golden premium fries lightly sprinkled with salt. Served hot.",
            "price": 119,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80",
            "category": "Sides"
        },
        {
            "id": "m1_5",
            "name": "Pepsi 500ml",
            "description": "Chilled carbonated soft drink to accompany your meal.",
            "price": 60,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
            "category": "Beverages"
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
            "category": "Veg Pizzas"
        },
        {
            "id": "m2_2",
            "name": "Peppy Paneer Pizza",
            "description": "Flavorful paneer cubes, crisp capsicum, and spicy red paprika, topped with gooey mozzarella cheese.",
            "price": 399,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
            "category": "Veg Pizzas"
        },
        {
            "id": "m2_3",
            "name": "Pepper Barbecue Chicken Pizza",
            "description": "Juicy pepper barbecue chicken shreds paired with onions and cheese for a smokey flavor.",
            "price": 449,
            "is_veg": False,
            "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
            "category": "Non-Veg Pizzas"
        },
        {
            "id": "m2_4",
            "name": "Garlic Breadsticks",
            "description": "Freshly baked garlic butter seasoned breadsticks. Best served with cheese dip.",
            "price": 139,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=500&q=80",
            "category": "Sides"
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
            "category": "Biryani"
        },
        {
            "id": "m3_2",
            "name": "Paneer Tikka Biryani",
            "description": "Soft paneer cubes marinated in tikka spices, slow-cooked in dum style with fragrant basmati rice.",
            "price": 249,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80",
            "category": "Biryani"
        },
        {
            "id": "m3_3",
            "name": "Double Ka Meetha",
            "description": "Classic Hyderabadi bread pudding dessert, prepared with fried bread slices soaked in saffron milk and dry fruits.",
            "price": 99,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=80",
            "category": "Desserts"
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
            "category": "Brownies"
        },
        {
            "id": "m4_2",
            "name": "Red Velvet Cake Pastry",
            "description": "Delicate red velvet sponge layers filled and frosted with our signature smooth cream cheese icing.",
            "price": 140,
            "is_veg": True,
            "image_url": "https://images.unsplash.com/photo-1586985289688-ca9cf4993cc0?auto=format&fit=crop&w=500&q=80",
            "category": "Pastries"
        }
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

