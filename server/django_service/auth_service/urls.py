"""URL routing for the authentication service."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/kds/", include("apps.kitchen_display_system.urls")),
    path("api/", include("apps.inventory.urls")),
    path("api/hr/", include("apps.hr.urls")),
    path("api/", include("apps.pos.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)