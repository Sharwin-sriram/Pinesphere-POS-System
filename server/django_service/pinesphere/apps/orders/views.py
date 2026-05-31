from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from authentication.models import Restaurant
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
        if not isinstance(payload, dict):
            try:
                payload = payload.copy()
            except AttributeError:
                payload = dict(payload)

        restaurant_id = payload.get("restaurant_id") or getattr(request.user, "restaurant_id", None)
        branch_id = payload.get("branch_id") or getattr(request.user, "branch_id", None)

        if not restaurant_id:
            return Response(
                {"success": False, "detail": "restaurant_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        restaurant = Restaurant.objects.filter(id=restaurant_id).first()
        if restaurant is None:
            return Response(
                {"success": False, "detail": "Restaurant not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not branch_id:
            first_branch = restaurant.branches.filter(is_active=True).first() or restaurant.branches.first()
            if first_branch:
                branch_id = str(first_branch.id)
                payload["branch_id"] = branch_id
            else:
                return Response(
                    {"success": False, "detail": "branch_id is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        payload["restaurant_id"] = restaurant_id

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
