from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from . import models, serializers, services


class OrderViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        qs = models.Order.objects.filter(branch_id=request.user.branch_id, deleted_at__isnull=True)
        data = serializers.OrderSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        order = models.Order.objects.get(id=pk, branch_id=request.user.branch_id)
        data = serializers.OrderSerializer(order).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def create(self, request):
        payload = request.data
        order = services.create_order(payload, user=request.user)
        self.log_audit(request, 'order_create', instance=order, payload_diff=payload)
        data = serializers.OrderSerializer(order).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = models.Order.objects.get(id=pk, branch_id=request.user.branch_id)
        new_status = request.data.get('status')
        order = services.update_order_status(order, new_status, changed_by=request.user)
        self.log_audit(request, 'order_status_update', instance=order, payload_diff=request.data)
        return Response({'success': True, 'data': {'status': order.status}, 'meta': {}}, status=status.HTTP_200_OK)
