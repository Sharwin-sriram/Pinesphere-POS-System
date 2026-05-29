from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin, TenantQuerysetMixin
from pinesphere.core.exceptions import ServiceError
from pinesphere.core.pagination import StandardPageNumberPagination
from . import models, services, serializers


class TableViewSet(AuditLogMixin, TenantQuerysetMixin, viewsets.ViewSet):
    pagination_class = StandardPageNumberPagination

    def list(self, request):
        qs = models.Table.objects.filter(restaurant=request.user.restaurant, deleted_at__isnull=True)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        read = serializers.TableReadSerializer(page, many=True)
        return paginator.get_paginated_response(read.data)

    def create(self, request):
        ser = serializers.TableWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        t = models.Table.objects.create(
            restaurant=request.user.restaurant,
            branch_id=data['branch_id'],
            name=data['name'],
            capacity=data['capacity'],
            floor_id=data.get('floor_id'),
            metadata=data.get('metadata'),
        )
        self.log_audit(request, 'create', instance=t, payload_diff=data)
        read = serializers.TableReadSerializer(t)
        return Response({'success': True, 'data': read.data, 'meta': {}}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            t = models.Table.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Table.DoesNotExist:
            raise ServiceError('table_not_found', 'Table not found', status_code=404)
        read = serializers.TableReadSerializer(t)
        return Response({'success': True, 'data': read.data, 'meta': {}}, status=status.HTTP_200_OK)

    def update(self, request, pk=None):
        try:
            t = models.Table.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Table.DoesNotExist:
            raise ServiceError('table_not_found', 'Table not found', status_code=404)
        ser = serializers.TableWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        t.name = data['name']
        t.capacity = data['capacity']
        t.floor_id = data.get('floor_id')
        t.metadata = data.get('metadata')
        t.save()
        self.log_audit(request, 'update', instance=t, payload_diff=data)
        return Response({'success': True, 'data': serializers.TableReadSerializer(t).data, 'meta': {}}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        try:
            t = models.Table.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Table.DoesNotExist:
            raise ServiceError('table_not_found', 'Table not found', status_code=404)
        t.deleted_at = timezone.now()
        t.save()
        self.log_audit(request, 'delete', instance=t, payload_diff={})
        return Response({'success': True, 'data': {}, 'meta': {}}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def status(self, request, pk=None):
        ser = serializers.StatusSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            t = models.Table.objects.get(id=pk, restaurant=request.user.restaurant, deleted_at__isnull=True)
        except models.Table.DoesNotExist:
            raise ServiceError('table_not_found', 'Table not found', status_code=404)
        services.update_table_status(t, ser.validated_data['status'], updated_by=request.user)
        self.log_audit(request, 'status_update', instance=t, payload_diff=ser.validated_data)
        return Response({'success': True, 'data': serializers.TableReadSerializer(t).data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def merge(self, request):
        ser = serializers.MergeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        target = services.merge_tables(data['table_ids'], data['target_table_id'], merged_by=request.user)
        self.log_audit(request, 'merge', instance=target, payload_diff=data)
        return Response({'success': True, 'data': serializers.TableReadSerializer(target).data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def split(self, request, pk=None):
        ser = serializers.SplitSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        created = services.split_table(pk, ser.validated_data['new_table_data'], split_by=request.user)
        self.log_audit(request, 'split', payload_diff=ser.validated_data)
        data = [serializers.TableReadSerializer(t).data for t in created]
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def live(self, request):
        branch_id = request.query_params.get('branch_id')
        data = services.get_live_floor(branch_id)
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)
