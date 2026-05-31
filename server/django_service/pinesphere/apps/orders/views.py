from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from authentication.models import Restaurant
from . import models, serializers, services


class OrderViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        user = request.user
        qs = models.Order.objects.filter(deleted_at__isnull=True)

        branch_id = getattr(user, 'branch_id', None)
        restaurant_id = getattr(user, 'restaurant_id', None)

        if branch_id:
            qs = qs.filter(branch_id=str(branch_id))
        elif restaurant_id:
            qs = qs.filter(restaurant_id=str(restaurant_id))
        else:
            # Customer user — show only their own orders
            qs = qs.filter(customer_id=str(user.id))

        qs = qs.order_by('-created_at')
        data = serializers.OrderSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = request.user
        qs = models.Order.objects.filter(deleted_at__isnull=True)
        branch_id = getattr(user, 'branch_id', None)
        restaurant_id = getattr(user, 'restaurant_id', None)
        try:
            if branch_id:
                order = qs.get(id=pk, branch_id=str(branch_id))
            elif restaurant_id:
                order = qs.get(id=pk, restaurant_id=str(restaurant_id))
            else:
                order = qs.get(id=pk, customer_id=str(user.id))
        except models.Order.DoesNotExist:
            return Response(
                {'success': False, 'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = serializers.OrderSerializer(order).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    def create(self, request):
        # Always work with a plain mutable dict copy so we can inject branch_id/restaurant_id
        try:
            payload = dict(request.data)
        except Exception:
            payload = {}

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
            if not first_branch:
                from authentication.models import Branch
                try:
                    first_branch = Branch.objects.create(
                        restaurant=restaurant,
                        name="Main Branch",
                        address=restaurant.address or "Default Address",
                        phone=restaurant.phone or "0000000000",
                        is_active=True
                    )
                except Exception:
                    pass
            
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
