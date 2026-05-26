from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
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
