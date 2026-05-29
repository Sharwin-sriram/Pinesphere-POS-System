from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KitchenDisplaySystemViewSet,
    KitchenViewSet,
    KitchenDepartmentViewSet,
    KitchenOrderStatusViewSet,
    KitchenOrderTicketViewSet,
    KOTViewSet,
    PreparationTimerViewSet,
    PrinterConfigurationViewSet,
    OrderPriorityViewSet,
    KitchenAlertViewSet,
    KitchenDashboardViewSet,
    KDSTicketViewSet,
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'systems', KitchenDisplaySystemViewSet, basename='kitchen-system')
router.register(r'kitchens', KitchenViewSet, basename='kitchen')
router.register(r'departments', KitchenDepartmentViewSet, basename='kitchen-department')
router.register(r'order-status', KitchenOrderStatusViewSet, basename='kitchen-order-status')
router.register(r'kots', KitchenOrderTicketViewSet, basename='kitchen-order-ticket')
router.register(r'timers', PreparationTimerViewSet, basename='preparation-timer')
router.register(r'printers', PrinterConfigurationViewSet, basename='printer-config')
router.register(r'priorities', OrderPriorityViewSet, basename='order-priority')
router.register(r'alerts', KitchenAlertViewSet, basename='kitchen-alert')
router.register(r'dashboard', KitchenDashboardViewSet, basename='kitchen-dashboard')
router.register(r'kot', KOTViewSet, basename='phase1-kot')
router.register(r'tickets', KDSTicketViewSet, basename='kds-ticket')

app_name = 'kitchen_display_system'

urlpatterns = [
    path('', include(router.urls)),
]
