from django.urls import path

from .views import *

urlpatterns = [

    # SUPPLIERS

    path(
        'suppliers/',
        SupplierListCreateView.as_view()
    ),

    path(
        'suppliers/<int:pk>/',
        SupplierDetailView.as_view()
    ),

    # INVENTORY

    path(
        'items/',
        InventoryListCreateView.as_view()
    ),

    path(
        'items/<int:pk>/',
        InventoryDetailView.as_view()
    ),

    path(
        'inventory/',
        InventoryListCreateView.as_view()
    ),

    path(
        'inventory/<int:pk>/',
        InventoryDetailView.as_view()
    ),

    # PURCHASE ORDERS

    path(
        'purchase-orders/',
        PurchaseOrderListCreateView.as_view()
    ),

    path(
        'purchase-orders/<int:pk>/',
        PurchaseOrderDetailView.as_view()
    ),

    # STOCK MOVEMENTS

    path(
        'stock-movements/',
        StockMovementListCreateView.as_view()
    ),

    # LOW STOCK

    path(
        'low-stock/',
        low_stock_items
    ),
    # Compatibility alias: frontend requests '/items/stock/low-stock/'
    path(
        'items/stock/low-stock/',
        low_stock_items
    ),
    # Additional alias for '/items/low-stock/' if used elsewhere
    path(
        'items/low-stock/',
        low_stock_items
    ),
]