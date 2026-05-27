"""URL routing for the authentication service."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from authentication.views import RestaurantRegisterView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("authentication.urls")),
<<<<<<< HEAD
    path("api/restaurant/register", RestaurantRegisterView.as_view()),
=======
>>>>>>> 17e93e17defde3a8c5c51eb027e65843f6d02e60
    path("api/kds/", include("apps.kitchen_display_system.urls")),
    path("api/", include("apps.inventory.urls")),
    path("api/hr/", include("apps.hr.urls")),
    path("api/", include("apps.pos.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)