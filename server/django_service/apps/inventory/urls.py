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
]