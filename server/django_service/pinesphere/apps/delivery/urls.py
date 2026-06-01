from rest_framework.routers import DefaultRouter
from .views import DeliveryViewSet, CourierViewSet

router = DefaultRouter()
router.register(r'deliveries', DeliveryViewSet, basename='deliveries')
router.register(r'couriers', CourierViewSet, basename='couriers')

urlpatterns = router.urls
