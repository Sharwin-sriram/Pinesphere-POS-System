from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from . import models, serializers, services


class DeliveryViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        qs = models.Delivery.objects.filter(branch_id=request.user.branch_id, deleted_at__isnull=True)
        data = serializers.DeliverySerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        d = models.Delivery.objects.get(id=pk, branch_id=request.user.branch_id)
        data = serializers.DeliverySerializer(d).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def create(self, request):
        payload = request.data
        order_id = payload.get('order_id')
        delivery = services.create_delivery(order_id, payload)
        self.log_audit(request, 'delivery_create', instance=delivery, payload_diff=payload)
        data = serializers.DeliverySerializer(delivery).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        delivery = models.Delivery.objects.get(id=pk, branch_id=request.user.branch_id)
        courier_id = request.data.get('courier_id')
        courier = models.DeliveryCourier.objects.get(id=courier_id)
        delivery = services.assign_courier(delivery, courier)
        self.log_audit(request, 'delivery_assign', instance=delivery, payload_diff=request.data)
        return Response({'success': True, 'data': {'status': delivery.status}, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        delivery = models.Delivery.objects.get(id=pk, branch_id=request.user.branch_id)
        new_status = request.data.get('status')
        delivery = services.update_status(delivery, new_status)
        self.log_audit(request, 'delivery_status_update', instance=delivery, payload_diff=request.data)
        return Response({'success': True, 'data': {'status': delivery.status}, 'meta': {}}, status=status.HTTP_200_OK)
