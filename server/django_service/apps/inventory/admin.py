from django.contrib import admin

from .models import (
    Supplier,
    Inventory,
    PurchaseOrder,
    StockMovement
)

admin.site.register(Supplier)
admin.site.register(Inventory)
admin.site.register(PurchaseOrder)
admin.site.register(StockMovement)