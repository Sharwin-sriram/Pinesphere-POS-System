from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
from .models import (
    KitchenDisplaySystem,
    Kitchen,
    KitchenDepartment,
    KitchenOrderStatus,
    KitchenOrderTicket,
    PreparationTimer,
    PrinterConfiguration,
    KOTPrintLog,
    OrderPriority,
    KitchenAlert,
)
from .serializers import (
    KitchenDisplaySystemSerializer,
    KitchenSerializer,
    KitchenDepartmentSerializer,
    KitchenOrderStatusSerializer,
    KitchenOrderTicketSerializer,
    KitchenOrderTicketDetailSerializer,
    PreparationTimerSerializer,
    PrinterConfigurationSerializer,
    KOTPrintLogSerializer,
    OrderPrioritySerializer,
    KitchenAlertSerializer,
    KitchenDashboardSerializer,
    KDSTicketSerializer,
    KDSStatsSerializer,
)
from .services.order_service import KitchenOrderService
from .services.printer_service import PrinterService
from .services.alert_service import AlertService


class KitchenDisplaySystemViewSet(viewsets.ModelViewSet):
    """ViewSet for Kitchen Display System configuration"""
    queryset = KitchenDisplaySystem.objects.all()
    serializer_class = KitchenDisplaySystemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter KDS by authenticated user's restaurant"""
        user = self.request.user
        return KitchenDisplaySystem.objects.filter(restaurant__owner=user)

    @action(detail=True, methods=['post'])
    def toggle_sound_alerts(self, request, pk=None):
        """Toggle sound alerts for KDS"""
        kds = self.get_object()
        kds.enable_sound_alerts = not kds.enable_sound_alerts
        kds.save()
        return Response({
            'status': 'success',
            'enable_sound_alerts': kds.enable_sound_alerts
        })

    @action(detail=True, methods=['post'])
    def toggle_ready_alerts(self, request, pk=None):
        """Toggle ready alerts for KDS"""
        kds = self.get_object()
        kds.enable_ready_alerts = not kds.enable_ready_alerts
        kds.save()
        return Response({
            'status': 'success',
            'enable_ready_alerts': kds.enable_ready_alerts
        })


class KitchenViewSet(viewsets.ModelViewSet):
    """ViewSet for Kitchen management"""
    queryset = Kitchen.objects.all()
    serializer_class = KitchenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter kitchens by KDS"""
        kds_id = self.request.query_params.get('kds_id')
        if kds_id:
            return Kitchen.objects.filter(kds_id=kds_id)
        return Kitchen.objects.all()

    @action(detail=True, methods=['get'])
    def get_pending_orders(self, request, pk=None):
        """Get all pending orders for this kitchen"""
        kitchen = self.get_object()
        kots = KitchenOrderTicket.objects.filter(
            kitchen=kitchen,
            status__in=['pending', 'printed']
        ).order_by('-created_at')
        serializer = KitchenOrderTicketSerializer(kots, many=True)
        return Response(serializer.data)


class KitchenDepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Kitchen Departments"""
    queryset = KitchenDepartment.objects.all()
    serializer_class = KitchenDepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter departments by kitchen"""
        kitchen_id = self.request.query_params.get('kitchen_id')
        if kitchen_id:
            return KitchenDepartment.objects.filter(kitchen_id=kitchen_id)
        return KitchenDepartment.objects.all()


class KitchenOrderStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for Kitchen Order Status tracking"""
    queryset = KitchenOrderStatus.objects.all()
    serializer_class = KitchenOrderStatusSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def mark_as_preparing(self, request, pk=None):
        """Mark order as preparing"""
        order_status = self.get_object()
        order_status.status = 'preparing'
        order_status.started_at = timezone.now()
        order_status.save()
        
        # Update KOT status
        KitchenOrderTicket.objects.filter(order=order_status.order).update(status='printed')
        
        return Response({
            'status': 'success',
            'order_status': KitchenOrderStatusSerializer(order_status).data
        })

    @action(detail=True, methods=['post'])
    def mark_as_ready(self, request, pk=None):
        """Mark order as ready"""
        order_status = self.get_object()
        order_status.status = 'ready'
        order_status.completed_at = timezone.now()
        order_status.save()
        
        # Create ready alert
        AlertService.create_ready_alert(order_status.order, order_status.kitchen)
        
        return Response({
            'status': 'success',
            'order_status': KitchenOrderStatusSerializer(order_status).data
        })

    @action(detail=True, methods=['post'])
    def mark_as_delayed(self, request, pk=None):
        """Mark order as delayed"""
        order_status = self.get_object()
        order_status.status = 'delayed'
        order_status.save()
        
        # Create delay alert
        AlertService.create_delay_alert(order_status.order, order_status.kitchen)
        
        return Response({
            'status': 'success',
            'order_status': KitchenOrderStatusSerializer(order_status).data
        })

    @action(detail=True, methods=['post'])
    def mark_as_served(self, request, pk=None):
        """Mark order as served"""
        order_status = self.get_object()
        order_status.status = 'served'
        order_status.save()
        
        return Response({
            'status': 'success',
            'order_status': KitchenOrderStatusSerializer(order_status).data
        })


class KitchenOrderTicketViewSet(viewsets.ModelViewSet):
    """ViewSet for Kitchen Order Tickets (KOT)"""
    queryset = KitchenOrderTicket.objects.all()
    serializer_class = KitchenOrderTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return KitchenOrderTicketDetailSerializer
        return KitchenOrderTicketSerializer

    @action(detail=True, methods=['post'])
    def print_kot(self, request, pk=None):
        """Print KOT to physical printer"""
        kot = self.get_object()
        printer_id = request.data.get('printer_id')
        
        try:
            printer = PrinterConfiguration.objects.get(id=printer_id)
            success = PrinterService.print_kot(kot, printer)
            
            if success:
                kot.print_count += 1
                kot.last_printed_at = timezone.now()
                kot.status = 'printed'
                kot.save()
                
                return Response({
                    'status': 'success',
                    'message': 'KOT printed successfully'
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Failed to print KOT'
                }, status=status.HTTP_400_BAD_REQUEST)
        except PrinterConfiguration.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Printer not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def reprint_kot(self, request, pk=None):
        """Reprint existing KOT"""
        kot = self.get_object()
        printer_id = request.data.get('printer_id')
        
        try:
            printer = PrinterConfiguration.objects.get(id=printer_id)
            success = PrinterService.print_kot(kot, printer, is_reprint=True)
            
            if success:
                kot.print_count += 1
                kot.last_printed_at = timezone.now()
                kot.save()
                
                return Response({
                    'status': 'success',
                    'message': 'KOT reprinted successfully'
                })
            else:
                return Response({
                    'status': 'error',
                    'message': 'Failed to reprint KOT'
                }, status=status.HTTP_400_BAD_REQUEST)
        except PrinterConfiguration.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Printer not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def cancel_kot(self, request, pk=None):
        """Cancel KOT"""
        kot = self.get_object()
        reason = request.data.get('reason', '')
        
        kot.status = 'cancelled'
        kot.save()
        
        # Cancel related order status
        KitchenOrderStatus.objects.filter(order=kot.order).update(status='cancelled')
        
        return Response({
            'status': 'success',
            'message': f'KOT cancelled. Reason: {reason}'
        })

    @action(detail=True, methods=['post'])
    def edit_kot(self, request, pk=None):
        """Edit KOT special instructions"""
        kot = self.get_object()
        special_instructions = request.data.get('special_instructions', '')
        
        kot.special_instructions = special_instructions
        kot.save()
        
        return Response({
            'status': 'success',
            'kot': KitchenOrderTicketSerializer(kot).data
        })

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get KOTs grouped by status"""
        kitchen_id = request.query_params.get('kitchen_id')
        
        if not kitchen_id:
            return Response(
                {'error': 'kitchen_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        kots_pending = KitchenOrderTicket.objects.filter(
            kitchen_id=kitchen_id, status='pending'
        ).order_by('created_at')
        
        kots_printed = KitchenOrderTicket.objects.filter(
            kitchen_id=kitchen_id, status='printed'
        ).order_by('created_at')
        
        kots_cancelled = KitchenOrderTicket.objects.filter(
            kitchen_id=kitchen_id, status='cancelled'
        ).order_by('-created_at')[:10]
        
        return Response({
            'pending': KitchenOrderTicketSerializer(kots_pending, many=True).data,
            'printed': KitchenOrderTicketSerializer(kots_printed, many=True).data,
            'cancelled': KitchenOrderTicketSerializer(kots_cancelled, many=True).data,
        })


class PreparationTimerViewSet(viewsets.ModelViewSet):
    """ViewSet for Preparation Timers"""
    queryset = PreparationTimer.objects.all()
    serializer_class = PreparationTimerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def stop_timer(self, request, pk=None):
        """Stop a preparation timer"""
        timer = self.get_object()
        timer.is_running = False
        timer.completed_at = timezone.now()
        timer.save()
        
        return Response({
            'status': 'success',
            'timer': PreparationTimerSerializer(timer).data
        })


class PrinterConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for Printer Configuration"""
    queryset = PrinterConfiguration.objects.all()
    serializer_class = PrinterConfigurationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter printers by KDS"""
        kds_id = self.request.query_params.get('kds_id')
        if kds_id:
            return PrinterConfiguration.objects.filter(kds_id=kds_id)
        return PrinterConfiguration.objects.all()

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test printer connection"""
        printer = self.get_object()
        is_connected = PrinterService.test_connection(printer)
        
        return Response({
            'status': 'connected' if is_connected else 'disconnected',
            'printer_id': str(printer.id)
        })


class OrderPriorityViewSet(viewsets.ModelViewSet):
    """ViewSet for Order Priority management"""
    queryset = OrderPriority.objects.all()
    serializer_class = OrderPrioritySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def update_priority(self, request, pk=None):
        """Update order priority"""
        priority = self.get_object()
        new_priority = request.data.get('priority')
        reason = request.data.get('reason', '')
        
        priority.priority = new_priority
        priority.reason = reason
        priority.set_by = request.user
        priority.save()
        
        return Response({
            'status': 'success',
            'priority': OrderPrioritySerializer(priority).data
        })


class KitchenAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for Kitchen Alerts"""
    queryset = KitchenAlert.objects.all()
    serializer_class = KitchenAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter alerts by kitchen"""
        kitchen_id = self.request.query_params.get('kitchen_id')
        if kitchen_id:
            return KitchenAlert.objects.filter(kitchen_id=kitchen_id)
        return KitchenAlert.objects.all()

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        alert.is_acknowledged = True
        alert.acknowledged_by = request.user
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        return Response({
            'status': 'success',
            'alert': KitchenAlertSerializer(alert).data
        })

    @action(detail=False, methods=['get'])
    def unacknowledged(self, request):
        """Get all unacknowledged alerts"""
        kitchen_id = request.query_params.get('kitchen_id')
        
        if not kitchen_id:
            return Response(
                {'error': 'kitchen_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alerts = KitchenAlert.objects.filter(
            kitchen_id=kitchen_id,
            is_acknowledged=False
        ).order_by('-created_at')
        
        serializer = KitchenAlertSerializer(alerts, many=True)
        return Response(serializer.data)


class KitchenDashboardViewSet(viewsets.ViewSet):
    """ViewSet for Kitchen Dashboard"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get kitchen dashboard summary"""
        kitchen_id = request.query_params.get('kitchen_id')
        
        if not kitchen_id:
            return Response(
                {'error': 'kitchen_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = KitchenOrderService()
        dashboard_data = service.get_kitchen_dashboard(kitchen_id)
        
        serializer = KitchenDashboardSerializer(dashboard_data)
        return Response(serializer.data)


# ─── KDS Ticket ViewSet ────────────────────────────────────────────────────────

class KDSTicketViewSet(viewsets.GenericViewSet):
    """ViewSet for the KDS board: fetch, bump, recall, hold, stats."""
    permission_classes = [IsAuthenticated]
    serializer_class = KDSTicketSerializer

    OVERDUE_THRESHOLD_MINUTES = 12

    def _get_base_qs(self):
        return KitchenOrderTicket.objects.select_related(
            'order', 'kitchen', 'department', 'bumped_by'
        ).prefetch_related('items')

    def _broadcast(self, kitchen_id, event_type, ticket):
        """Push a ticket update to all clients connected to this kitchen's WS group."""
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        group_name = f'kitchen_{kitchen_id}'
        payload = {
            'type': 'ticket_update',
            'event': event_type,
            'ticket': KDSTicketSerializer(ticket).data,
        }
        # Serialize datetime objects before sending
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'kds_ticket_update',
                'payload': json.dumps(payload, default=str),
            },
        )

    def list(self, request):
        """GET /api/kds/tickets/ — active tickets for a station, sorted oldest-first.

        Query params:
          - station (kitchen id, required)
          - status  (active|bumped|recalled|held, default: active)
          - order_type (dine_in|takeaway|delivery)
        """
        kitchen_id = request.query_params.get('station')
        if not kitchen_id:
            return Response(
                {'error': 'station query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filter_status = request.query_params.get('status', 'active')
        order_type = request.query_params.get('order_type')

        # 'active' maps to pending/printed/recalled (non-terminal, non-bumped)
        if filter_status == 'active':
            qs = self._get_base_qs().filter(
                kitchen_id=kitchen_id,
                status__in=['pending', 'printed', 'recalled'],
            )
        elif filter_status == 'held':
            qs = self._get_base_qs().filter(
                kitchen_id=kitchen_id, hold=True,
            )
        else:
            qs = self._get_base_qs().filter(
                kitchen_id=kitchen_id, status=filter_status,
            )

        if order_type:
            qs = qs.filter(order_type=order_type)

        # Held tickets sorted last, then oldest-first within each group
        qs = qs.order_by('hold', 'created_at')

        serializer = KDSTicketSerializer(qs, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})

    @action(detail=True, methods=['patch'])
    def bump(self, request, pk=None):
        """PATCH /api/kds/tickets/<id>/bump/ — mark ticket as completed."""
        try:
            ticket = self._get_base_qs().get(pk=pk)
        except KitchenOrderTicket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status == 'bumped':
            return Response(
                {'error': 'Ticket is already bumped'},
                status=status.HTTP_409_CONFLICT,
            )

        ticket.status = 'bumped'
        ticket.bumped_at = timezone.now()
        ticket.bumped_by = request.user
        ticket.hold = False
        ticket.save(update_fields=['status', 'bumped_at', 'bumped_by', 'hold', 'updated_at'])

        self._broadcast(ticket.kitchen_id, 'bumped', ticket)
        return Response(KDSTicketSerializer(ticket).data)

    @action(detail=True, methods=['patch'])
    def recall(self, request, pk=None):
        """PATCH /api/kds/tickets/<id>/recall/ — revert a bumped ticket to active."""
        try:
            ticket = self._get_base_qs().get(pk=pk)
        except KitchenOrderTicket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        ticket.status = 'recalled'
        ticket.recalled_at = timezone.now()
        ticket.save(update_fields=['status', 'recalled_at', 'updated_at'])

        self._broadcast(ticket.kitchen_id, 'recalled', ticket)
        return Response(KDSTicketSerializer(ticket).data)

    @action(detail=True, methods=['patch'])
    def hold(self, request, pk=None):
        """PATCH /api/kds/tickets/<id>/hold/ — toggle the hold flag."""
        try:
            ticket = self._get_base_qs().get(pk=pk)
        except KitchenOrderTicket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        ticket.hold = not ticket.hold
        ticket.save(update_fields=['hold', 'updated_at'])

        self._broadcast(ticket.kitchen_id, 'held' if ticket.hold else 'unheld', ticket)
        return Response(KDSTicketSerializer(ticket).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """GET /api/kds/tickets/stats/ — aggregate stats for a kitchen station."""
        kitchen_id = request.query_params.get('station')
        if not kitchen_id:
            return Response(
                {'error': 'station query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        threshold = timezone.now() - timedelta(minutes=self.OVERDUE_THRESHOLD_MINUTES)
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        active_qs = KitchenOrderTicket.objects.filter(
            kitchen_id=kitchen_id,
            status__in=['pending', 'printed', 'recalled'],
        )

        active_count = active_qs.count()
        overdue_count = active_qs.filter(created_at__lte=threshold).count()

        bumped_today = KitchenOrderTicket.objects.filter(
            kitchen_id=kitchen_id,
            status='bumped',
            bumped_at__gte=today_start,
        ).count()

        # Average prep time today (seconds) for bumped tickets
        bumped_today_qs = KitchenOrderTicket.objects.filter(
            kitchen_id=kitchen_id,
            status='bumped',
            bumped_at__gte=today_start,
            bumped_at__isnull=False,
        )
        avg_prep_seconds = 0.0
        if bumped_today_qs.exists():
            total_seconds = sum(
                (t.bumped_at - t.created_at).total_seconds()
                for t in bumped_today_qs
            )
            avg_prep_seconds = total_seconds / bumped_today_qs.count()

        data = {
            'active_count': active_count,
            'overdue_count': overdue_count,
            'bumped_today': bumped_today,
            'avg_prep_seconds': round(avg_prep_seconds, 1),
        }
        return Response(KDSStatsSerializer(data).data)
