from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from . import models, serializers, services


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = models.Transaction.objects.all()
    serializer_class = serializers.TransactionSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = models.Subscription.objects.all()
    serializer_class = serializers.SubscriptionSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        sub = self.get_object()
        services.cancel_subscription(sub)
        return Response(self.get_serializer(sub).data)


@api_view(['POST'])
def gateway_webhook(request, provider):
    # Minimal webhook receiver; provider-specific parsing belongs in integrations
    payload = request.data
    # For now, just return OK and log the payload; integration logic should update transactions
    return Response({'status': 'received', 'provider': provider}, status=status.HTTP_200_OK)
