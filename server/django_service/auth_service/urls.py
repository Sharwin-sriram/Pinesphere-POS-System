"""URL routing for the authentication service."""

from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("apps.authentication.urls")),
    path("api/kds/", include("apps.kitchen_display_system.urls")),
]