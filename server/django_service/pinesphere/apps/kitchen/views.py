from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from pinesphere.core.exceptions import ServiceError
from . import services, serializers, models


class KOTViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        qs = models.KOT.objects.filter(branch__restaurant=request.user.restaurant, deleted_at__isnull=True)
        data = serializers.KOTSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        try:
            kot = models.KOT.objects.get(id=pk, branch__restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.KOT.DoesNotExist:
            raise ServiceError('kot_not_found', 'KOT not found', status_code=404)
        return Response({'success': True, 'data': serializers.KOTSerializer(kot).data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def status(self, request, pk=None):
        status_val = request.data.get('status')
        kot = services.update_kot_status(pk, status_val, staff=request.user)
        self.log_audit(request, 'update_kot_status', instance=kot, payload_diff={'status': status_val})
        return Response({'success': True, 'data': serializers.KOTSerializer(kot).data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reprint(self, request, pk=None):
        payload = services.reprint_kot(pk, requested_by=request.user, reason=request.data.get('reason'))
        self.log_audit(request, 'reprint_kot', instance=None, payload_diff={'kot_id': pk})
        return Response({'success': True, 'data': payload, 'meta': {}}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        kot = services.cancel_kot(pk, cancelled_by=request.user)
        self.log_audit(request, 'cancel_kot', instance=kot, payload_diff={})
        return Response({'success': True, 'data': {}, 'meta': {}}, status=status.HTTP_204_NO_CONTENT)
