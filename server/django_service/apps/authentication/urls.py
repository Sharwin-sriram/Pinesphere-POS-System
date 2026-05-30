"""URLs for authentication app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"restaurants", views.RestaurantViewSet, basename="restaurant")

urlpatterns = [
    path("", include(router.urls)),
    # Nested route for branches under a restaurant
    path(
        "restaurant/<uuid:restaurant_id>/branches/",
        views.BranchViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="branch-list",
    ),
    path(
        "restaurant/<uuid:restaurant_id>/branches/<uuid:pk>/",
        views.BranchViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="branch-detail",
    ),
    path(
        "restaurant/<uuid:restaurant_id>/branches/active/",
        views.BranchViewSet.as_view({"get": "active"}),
        name="branch-active",
    ),
    path(
        "restaurant/<uuid:restaurant_id>/branches/inactive/",
        views.BranchViewSet.as_view({"get": "inactive"}),
        name="branch-inactive",
    ),
]
