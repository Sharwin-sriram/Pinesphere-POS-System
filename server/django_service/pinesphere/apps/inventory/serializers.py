from rest_framework import serializers
from . import models


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InventoryItem
        fields = ['id', 'name', 'item_code', 'uom', 'current_stock', 'reorder_level', 'avg_cost']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PurchaseOrder
        fields = ['id', 'po_number', 'supplier', 'branch', 'status', 'total_amount']
