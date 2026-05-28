from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pinesphere.core.mixins import AuditLogMixin
from pinesphere.core.exceptions import ServiceError
from . import services, models, serializers


class CustomerViewSet(AuditLogMixin, viewsets.ViewSet):
    def list(self, request):
        qs = models.Customer.objects.filter(restaurant=request.user.restaurant, deleted_at__isnull=True)
        data = serializers.CustomerSerializer(qs, many=True).data
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def loyalty_earn(self, request, pk=None):
        customer = models.Customer.objects.get(id=pk, restaurant=request.user.restaurant)
        order_id = request.data.get('order_id')
        order = None
        if order_id:
            from pinesphere.apps.billing.models import Order
            order = Order.objects.get(id=order_id)
        tx = services.earn_loyalty_points(customer, order, int(request.data.get('points', 0)))
        self.log_audit(request, 'loyalty_earn', instance=customer, payload_diff=request.data)
        return Response({'success': True, 'data': {'transaction_id': tx.id}, 'meta': {}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def loyalty_redeem(self, request, pk=None):
        customer = models.Customer.objects.get(id=pk, restaurant=request.user.restaurant)
        result = services.redeem_points(customer, int(request.data.get('points', 0)))
        self.log_audit(request, 'loyalty_redeem', instance=customer, payload_diff=request.data)
        return Response({'success': True, 'data': {'discount_amount': str(result['discount_amount'])}, 'meta': {}}, status=status.HTTP_200_OK)
