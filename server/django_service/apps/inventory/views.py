from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import models

from .models import (
    Supplier,
    Inventory,
    PurchaseOrder,
    StockMovement
)

from .serializers import (
    SupplierSerializer,
    InventorySerializer,
    PurchaseOrderSerializer,
    StockMovementSerializer
)


# SUPPLIER VIEWS

class SupplierListCreateView(generics.ListCreateAPIView):

    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


# INVENTORY VIEWS

class InventoryListCreateView(generics.ListCreateAPIView):

    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


# PURCHASE ORDER VIEWS

class PurchaseOrderListCreateView(generics.ListCreateAPIView):

    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer


# STOCK MOVEMENT VIEWS

class StockMovementListCreateView(generics.ListCreateAPIView):

    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer


# LOW STOCK API

@api_view(['GET'])
def low_stock_items(request):

    items = Inventory.objects.filter(
        quantity__lte=models.F('reorder_level')
    )

    serializer = InventorySerializer(items, many=True)

    return Response(serializer.data)