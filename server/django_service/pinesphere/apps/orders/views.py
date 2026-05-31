from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from authentication.models import Restaurant
from . import models, serializers, services


# ─── Allowed status transitions ───────────────────────────────────────────────
# key = current status, value = list of valid next statuses
VALID_TRANSITIONS = {
    'pending':          ['preparing', 'cancelled'],
    'confirmed':        ['preparing', 'cancelled'],
    'preparing':        ['ready', 'cancelled'],
    'ready':            ['out_for_delivery', 'cancelled'],
    'out_for_delivery': ['delivered', 'cancelled'],
    'delivered':        [],
    'cancelled':        [],
    'refunded':         [],
    'payment_failed':   ['pending'],
}


def _get_order_for_user(qs, pk, user):
    """Return the order or raise DoesNotExist, scoped to the user's access level."""
    branch_id     = getattr(user, 'branch_id',     None)
    restaurant_id = getattr(user, 'restaurant_id', None)

    if branch_id:
        return qs.get(id=pk, branch_id=str(branch_id))
    if restaurant_id:
        return qs.get(id=pk, restaurant_id=str(restaurant_id))
    # Delivery / customer fallback — just check existence
    return qs.get(id=pk)


class OrderViewSet(AuditLogMixin, viewsets.ViewSet):

    # ── List ──────────────────────────────────────────────────────────────────
    def list(self, request):
        user = request.user
        qs   = models.Order.objects.filter(deleted_at__isnull=True)

        branch_id     = getattr(user, 'branch_id',     None)
        restaurant_id = getattr(user, 'restaurant_id', None)

        # Optional status filter from query params (e.g. ?status=ready,out_for_delivery)
        status_filter = request.query_params.get('status', '')
        status_list   = [s.strip() for s in status_filter.split(',') if s.strip()]

        if branch_id:
            qs = qs.filter(branch_id=str(branch_id))
        elif restaurant_id:
            qs = qs.filter(restaurant_id=str(restaurant_id))
        else:
            # Customer — own orders only; delivery staff pass ?status= instead
            if not status_list:
                qs = qs.filter(customer_id=str(user.id))
            # If status_list is provided and user has no restaurant/branch, show
            # all matching orders (delivery use-case)

        if status_list:
            qs = qs.filter(status__in=status_list)

        qs   = qs.order_by('-created_at')
        data = serializers.OrderSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    # ── Retrieve ──────────────────────────────────────────────────────────────
    def retrieve(self, request, pk=None):
        qs = models.Order.objects.filter(deleted_at__isnull=True)
        try:
            order = _get_order_for_user(qs, pk, request.user)
        except models.Order.DoesNotExist:
            return Response(
                {'success': False, 'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = serializers.OrderSerializer(order).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    # ── Create ────────────────────────────────────────────────────────────────
    def create(self, request):
        try:
            payload = dict(request.data)
        except Exception:
            payload = {}

        restaurant_id = payload.get('restaurant_id') or getattr(request.user, 'restaurant_id', None)
        branch_id     = payload.get('branch_id')     or getattr(request.user, 'branch_id',     None)

        if not restaurant_id:
            return Response(
                {'success': False, 'detail': 'restaurant_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        restaurant = Restaurant.objects.filter(id=restaurant_id).first()
        if restaurant is None:
            return Response(
                {'success': False, 'detail': 'Restaurant not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not branch_id:
            first_branch = (
                restaurant.branches.filter(is_active=True).first()
                or restaurant.branches.first()
            )
            if not first_branch:
                from authentication.models import Branch
                try:
                    first_branch = Branch.objects.create(
                        restaurant=restaurant,
                        name='Main Branch',
                        address=restaurant.address or 'Default Address',
                        phone=restaurant.phone or '0000000000',
                        is_active=True,
                    )
                except Exception:
                    pass

            if first_branch:
                branch_id            = str(first_branch.id)
                payload['branch_id'] = branch_id
            else:
                return Response(
                    {'success': False, 'detail': 'branch_id is required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        payload['restaurant_id'] = restaurant_id

        order = services.create_order(payload, user=request.user)
        self.log_audit(request, 'order_create', instance=order, payload_diff=payload)
        data = serializers.OrderSerializer(order).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_201_CREATED)

    # ── Update Status ─────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        new_status = request.data.get('status', '').strip()
        if not new_status:
            return Response(
                {'success': False, 'detail': 'status is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = models.Order.objects.filter(deleted_at__isnull=True)
        try:
            order = _get_order_for_user(qs, pk, request.user)
        except models.Order.DoesNotExist:
            return Response(
                {'success': False, 'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        allowed = VALID_TRANSITIONS.get(order.status, [])
        if new_status not in allowed:
            return Response(
                {
                    'success': False,
                    'detail': (
                        f"Cannot transition from '{order.status}' to '{new_status}'. "
                        f"Allowed transitions: {allowed or 'none'}."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = services.update_order_status(order, new_status, changed_by=request.user)
        self.log_audit(request, 'order_status_update', instance=order, payload_diff=request.data)
        data = serializers.OrderSerializer(order).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)
