from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.permissions import IsCashier
from pinesphere.core.mixins import AuditLogMixin
from pinesphere.core.exceptions import ServiceError
from pinesphere.core.pagination import StandardPageNumberPagination
from . import services, serializers, models


class OrderViewSet(AuditLogMixin, viewsets.ViewSet):
    pagination_class = StandardPageNumberPagination

    def create(self, request):
        serializer = serializers.OrderWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        tenant = request.user.restaurant
        branch = models.Branch.objects.get(id=data['branch_id'])
        order = services.create_order(tenant, branch, data['order_type'], table_id=data.get('table_id'), items=data['items'], customer=None, created_by=request.user)
        self.log_audit(request, 'create', instance=order, payload_diff=data)
        read = serializers.OrderReadSerializer(order)
        return Response({'success': True, 'data': read.data, 'meta': {}}, status=status.HTTP_201_CREATED)

    def list(self, request):
        qs = models.Order.objects.filter(restaurant=request.user.restaurant, deleted_at__isnull=True)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        read = serializers.OrderReadSerializer(page, many=True)
        return paginator.get_paginated_response(read.data)

    def retrieve(self, request, pk=None):
        try:
            o = models.Order.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Order.DoesNotExist:
            raise ServiceError('order_not_found', 'Order not found', status_code=404)
        read = serializers.OrderReadSerializer(o)
        return Response({'success': True, 'data': read.data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def items(self, request, pk=None):
        # add item
        try:
            order = models.Order.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Order.DoesNotExist:
            raise ServiceError('order_not_found', 'Order not found', status_code=404)
        ser = serializers.OrderItemWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        item = services.add_item(order, ser.validated_data['menu_item_id'], ser.validated_data['qty'], modifiers=ser.validated_data.get('modifiers'), notes=ser.validated_data.get('notes'))
        self.log_audit(request, 'add_item', instance=order, payload_diff=ser.validated_data)
        return Response({'success': True, 'data': {'item_id': item.id}, 'meta': {}}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def payment(self, request, pk=None):
        try:
            order = models.Order.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Order.DoesNotExist:
            raise ServiceError('order_not_found', 'Order not found', status_code=404)
        payments = request.data.get('payments', [])
        ser_list = [p for p in payments]
        created = services.process_payment(order, ser_list, processed_by=request.user)
        self.log_audit(request, 'payment', instance=order, payload_diff={'payments': ser_list})
        return Response({'success': True, 'data': {'payments': [p.id for p in created]}, 'meta': {}}, status=status.HTTP_200_OK)
