from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from pinesphere.core.exceptions import ServiceError
from . import models, services, serializers


class InventoryItemViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        qs = models.InventoryItem.objects.filter(branch__restaurant=request.user.restaurant, deleted_at__isnull=True)
        data = serializers.InventoryItemSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def check_low(self, request):
        branch = request.data.get('branch_id')
        data = services.check_low_stock(branch)
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def transfer(self, request):
        payload = request.data
        st = services.transfer_stock(payload['from_branch'], payload['to_branch'], payload['item_id'], payload['qty'], created_by=request.user)
        self.log_audit(request, 'transfer_stock', instance=st, payload_diff=payload)
        return Response({'success': True, 'data': {'transfer_id': st.id}, 'meta': {}}, status=status.HTTP_200_OK)
