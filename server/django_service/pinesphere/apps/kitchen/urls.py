from rest_framework.routers import DefaultRouter
from .views import KOTViewSet

router = DefaultRouter()
router.register(r'kot', KOTViewSet, basename='kot')

urlpatterns = router.urls
