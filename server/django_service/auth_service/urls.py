"""URL routing for the authentication service."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from authentication.views import RestaurantRegisterView
from apps.authentication.views import BranchViewSet


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
    path("api/", include("authentication.urls")),
    path("api/restaurant/register", RestaurantRegisterView.as_view()),
    path(
        "api/restaurant/<uuid:restaurant_id>/branches/",
        BranchViewSet.as_view({"get": "list", "post": "create"}),
        name="branch-list",
    ),
    path(
        "api/restaurant/<uuid:restaurant_id>/branches/<uuid:pk>/",
        BranchViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}),
        name="branch-detail",
    ),
    path(
        "api/restaurant/<uuid:restaurant_id>/branches/active/",
        BranchViewSet.as_view({"get": "active"}),
        name="branch-active",
    ),
    path(
        "api/restaurant/<uuid:restaurant_id>/branches/inactive/",
        BranchViewSet.as_view({"get": "inactive"}),
        name="branch-inactive",
    ),
    path("api/kds/", include("apps.kitchen_display_system.urls")),
    path("api/settings/", include("apps.restaurant_settings.urls")),
    path("api/", include("apps.inventory.urls")),
    path("api/hr/", include("apps.hr.urls")),
    path("api/", include("apps.pos.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)