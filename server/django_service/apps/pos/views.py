from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


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

    restaurants = [
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

    filtered = [r for r in restaurants if matches(r)]

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
