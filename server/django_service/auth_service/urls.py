"""URL routing for the authentication service."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from authentication.views import RestaurantRegisterView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
    # Spec-compatible v1 prefix (keep existing /auth/ for backward compatibility).
    path("api/v1/auth/", include("authentication.urls")),
    path("api/v1/", include("pinesphere.apps.orders.urls")),
    path("api/v1/", include("pinesphere.apps.kitchen.urls")),
    path("api/restaurant/register", RestaurantRegisterView.as_view()),
    path("api/kds/", include("pinesphere.apps.kitchen.urls")),
    path("api/", include("pinesphere.apps.inventory.urls")),
    path("api/hr/", include("apps.hr.urls")),
    path("api/", include("apps.pos.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)