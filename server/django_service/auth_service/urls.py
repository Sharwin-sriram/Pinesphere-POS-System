"""URL routing for the authentication service."""

from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
    path("api/kds/", include("apps.kitchen_display_system.urls")),
    path("api/", include("apps.inventory.urls")),
    path("api/", include("apps.pos.urls")),
]