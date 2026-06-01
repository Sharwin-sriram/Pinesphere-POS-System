from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from . import models, serializers, services

class DeliveryViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        branch_id = getattr(request.user, 'branch_id', None)
        qs = models.Delivery.objects.filter(deleted_at__isnull=True)
        if branch_id:
            qs = qs.filter(branch_id=branch_id)
        data = serializers.DeliverySerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        branch_id = getattr(request.user, 'branch_id', None)
        qs = models.Delivery.objects.filter(id=pk)
        if branch_id:
            qs = qs.filter(branch_id=branch_id)
        d = qs.first()
        if not d:
            return Response({'success': False, 'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
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
        delivery = models.Delivery.objects.get(id=pk)
        courier_id = request.data.get('courier_id')
        courier = models.DeliveryCourier.objects.get(id=courier_id)
        delivery = services.assign_courier(delivery, courier)
        self.log_audit(request, 'delivery_assign', instance=delivery, payload_diff=request.data)
        return Response({'success': True, 'data': {'status': delivery.status}, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        delivery = models.Delivery.objects.get(id=pk)
        new_status = request.data.get('status')
        delivery = services.update_status(delivery, new_status)
        self.log_audit(request, 'delivery_status_update', instance=delivery, payload_diff=request.data)
        return Response({'success': True, 'data': {'status': delivery.status}, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        delivery = models.Delivery.objects.get(id=pk)
        courier_id = request.data.get('courier_id')
        courier = models.DeliveryCourier.objects.get(id=courier_id)
        delivery = services.assign_courier(delivery, courier)
        self.log_audit(request, 'delivery_accepted_by_courier', instance=delivery, payload_diff={'courier_id': courier_id})
        return Response({'success': True, 'data': {'status': delivery.status}, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        delivery = models.Delivery.objects.get(id=pk)
        courier_id = request.data.get('courier_id')
        # In a real system, you'd track rejected couriers in a join table to avoid re-assigning.
        # For now, we just log it.
        self.log_audit(request, 'delivery_rejected_by_courier', instance=delivery, payload_diff={'courier_id': courier_id})
        return Response({'success': True, 'data': {'status': delivery.status}, 'meta': {}}, status=status.HTTP_200_OK)


class CourierViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        qs = models.DeliveryCourier.objects.filter(deleted_at__isnull=True)
        data = serializers.DeliveryCourierSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        c = models.DeliveryCourier.objects.get(id=pk)
        data = serializers.DeliveryCourierSerializer(c).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def create(self, request):
        serializer = serializers.DeliveryCourierSerializer(data=request.data)
        if serializer.is_valid():
            courier = serializer.save()
            self.log_audit(request, 'courier_create', instance=courier, payload_diff=request.data)
            return Response({'success': True, 'data': serializer.data, 'meta': {}}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
