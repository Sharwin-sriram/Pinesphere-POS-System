"""
Order Service - Handles kitchen order operations and synchronization
"""
from django.utils import timezone
from django.db.models import Q, Count
from ..models import (
    KitchenOrderStatus,
    KitchenOrderTicket,
    PreparationTimer,
    OrderPriority,
)


class KitchenOrderService:
    """Service for kitchen order management"""

    def create_kitchen_order(self, order, kitchen, department=None):
        """
        Create kitchen order status and KOT
        
        Args:
            order: Order instance
            kitchen: Kitchen instance
            department: KitchenDepartment instance (optional)
        
        Returns:
            tuple: (KitchenOrderStatus, KitchenOrderTicket)
        """
        # Create kitchen order status
        kitchen_status = KitchenOrderStatus.objects.create(
            order=order,
            kitchen=kitchen,
            department=department,
            status='new',
            estimated_ready_time=timezone.now()
        )
        
        # Create KOT
        kot_number = self._generate_kot_number(kitchen)
        kot = KitchenOrderTicket.objects.create(
            order=order,
            kitchen=kitchen,
            department=department,
            kot_number=kot_number,
            status='pending'
        )
        
        # Create preparation timer
        default_duration = kitchen.kds.preparation_time_default
        PreparationTimer.objects.create(
            order=order,
            kitchen_status=kitchen_status,
            estimated_duration=default_duration,
            is_running=True
        )
        
        return kitchen_status, kot

    def update_order_status(self, order, new_status, kitchen=None, notes=''):
        """
        Update kitchen order status
        
        Args:
            order: Order instance
            new_status: New status value
            kitchen: Kitchen instance (optional)
            notes: Additional notes
        """
        if kitchen:
            order_status = KitchenOrderStatus.objects.filter(
                order=order,
                kitchen=kitchen
            ).latest('created_at')
        else:
            order_status = KitchenOrderStatus.objects.filter(
                order=order
            ).latest('created_at')
        
        order_status.status = new_status
        order_status.notes = notes
        
        if new_status == 'preparing':
            order_status.started_at = timezone.now()
        elif new_status in ['ready', 'served']:
            order_status.completed_at = timezone.now()
        
        order_status.save()
        
        # Stop timer if order is ready or served
        if new_status in ['ready', 'served']:
            self.stop_preparation_timer(order, order_status)
        
        return order_status

    def stop_preparation_timer(self, order, kitchen_status=None):
        """Stop preparation timer for an order"""
        if not kitchen_status:
            kitchen_status = KitchenOrderStatus.objects.filter(
                order=order
            ).latest('created_at')
        
        timers = PreparationTimer.objects.filter(
            order=order,
            kitchen_status=kitchen_status,
            is_running=True
        )
        
        for timer in timers:
            timer.is_running = False
            timer.completed_at = timezone.now()
            timer.save()

    def get_kitchen_dashboard(self, kitchen_id):
        """
        Get kitchen dashboard data
        
        Returns:
            dict: Dashboard summary with order counts and lists
        """
        from ..models import Kitchen
        
        try:
            kitchen = Kitchen.objects.get(id=kitchen_id)
        except Kitchen.DoesNotExist:
            return {
                'total_pending': 0,
                'total_preparing': 0,
                'total_ready': 0,
                'total_delayed': 0,
                'pending_orders': [],
                'preparing_orders': [],
                'ready_orders': [],
                'delayed_orders': [],
            }
        
        # Get KOTs by status
        pending_kots = KitchenOrderTicket.objects.filter(
            kitchen=kitchen,
            status='pending'
        ).order_by('created_at')
        
        preparing_kots = KitchenOrderTicket.objects.filter(
            kitchen=kitchen,
            status__in=['printed']
        ).order_by('created_at')
        
        ready_kots = KitchenOrderTicket.objects.filter(
            kitchen=kitchen,
            status='printed'
        ).filter(
            order__kitchen_status__status='ready'
        ).distinct().order_by('-created_at')
        
        # Get delayed orders
        delayed_kots = KitchenOrderTicket.objects.filter(
            kitchen=kitchen,
            status__in=['pending', 'printed']
        ).filter(
            order__kitchen_status__status='delayed'
        ).distinct().order_by('-created_at')
        
        return {
            'total_pending': pending_kots.count(),
            'total_preparing': preparing_kots.count(),
            'total_ready': ready_kots.count(),
            'total_delayed': delayed_kots.count(),
            'pending_orders': pending_kots,
            'preparing_orders': preparing_kots,
            'ready_orders': ready_kots,
            'delayed_orders': delayed_kots,
        }

    def get_order_by_priority(self, kitchen):
        """
        Get orders sorted by priority
        
        Args:
            kitchen: Kitchen instance
        
        Returns:
            QuerySet: Orders sorted by priority (descending)
        """
        return KitchenOrderTicket.objects.filter(
            kitchen=kitchen,
            status__in=['pending', 'printed']
        ).select_related(
            'order__kitchen_priority'
        ).order_by(
            '-order__kitchen_priority__priority',
            'created_at'
        )

    def mark_order_as_delayed(self, order, kitchen=None, reason=''):
        """
        Mark an order as delayed
        
        Args:
            order: Order instance
            kitchen: Kitchen instance (optional)
            reason: Reason for delay
        """
        return self.update_order_status(
            order,
            'delayed',
            kitchen=kitchen,
            notes=f"Delayed. Reason: {reason}"
        )

    def _generate_kot_number(self, kitchen):
        """Generate unique KOT number"""
        import uuid
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        unique_id = str(uuid.uuid4())[:6].upper()
        return f"KOT-{kitchen.id.hex[:4]}-{timestamp}-{unique_id}"

    def sync_orders_realtime(self, kitchen):
        """
        Get all orders that need real-time sync
        Used for WebSocket synchronization
        
        Args:
            kitchen: Kitchen instance
        
        Returns:
            dict: Orders grouped by status
        """
        statuses = ['new', 'preparing', 'ready', 'delayed']
        orders_by_status = {}
        
        for status in statuses:
            orders_by_status[status] = KitchenOrderStatus.objects.filter(
                kitchen=kitchen,
                status=status
            ).select_related('order').order_by('-created_at')
        
        return orders_by_status

    def get_kitchen_metrics(self, kitchen, days=1):
        """
        Get kitchen performance metrics
        
        Args:
            kitchen: Kitchen instance
            days: Number of days to look back
        
        Returns:
            dict: Performance metrics
        """
        from django.utils import timezone
        from datetime import timedelta
        
        start_date = timezone.now() - timedelta(days=days)
        
        orders = KitchenOrderStatus.objects.filter(
            kitchen=kitchen,
            created_at__gte=start_date
        )
        
        total_orders = orders.count()
        completed_orders = orders.filter(status__in=['ready', 'served']).count()
        delayed_orders = orders.filter(status='delayed').count()
        
        # Calculate average preparation time
        completed_with_timers = PreparationTimer.objects.filter(
            order__kitchen_status__kitchen=kitchen,
            completed_at__isnull=False,
            kitchen_status__created_at__gte=start_date
        )
        
        avg_prep_time = 0
        if completed_with_timers.exists():
            total_time = sum([timer.elapsed_time for timer in completed_with_timers])
            avg_prep_time = total_time / completed_with_timers.count()
        
        return {
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'delayed_orders': delayed_orders,
            'completion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0,
            'delay_rate': (delayed_orders / total_orders * 100) if total_orders > 0 else 0,
            'average_preparation_time': round(avg_prep_time, 2),
        }
