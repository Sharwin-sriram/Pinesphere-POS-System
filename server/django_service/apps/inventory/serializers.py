from rest_framework import serializers

from .models import (
    Supplier,
    Inventory,
    PurchaseOrder,
    StockMovement
)


class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):

    supplier_name = serializers.CharField(
        source='supplier.supplier_name',
        read_only=True
    )

    class Meta:
        model = Inventory
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = PurchaseOrder
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockMovement
        fields = '__all__'