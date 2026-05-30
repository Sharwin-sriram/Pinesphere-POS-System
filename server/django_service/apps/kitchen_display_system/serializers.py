from rest_framework import serializers
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


class KitchenDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KitchenDepartment
        fields = ['id', 'name', 'description', 'display_order', 'is_active', 'created_at', 'updated_at']


class KitchenSerializer(serializers.ModelSerializer):
    departments = KitchenDepartmentSerializer(many=True, read_only=True)

    class Meta:
        model = Kitchen
        fields = ['id', 'name', 'description', 'kitchen_type', 'is_active', 'departments', 'created_at', 'updated_at']


class PrinterConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrinterConfiguration
        fields = [
            'id', 'name', 'printer_type', 'connection_type',
            'printer_address', 'port_number', 'is_active', 'is_default',
            'paper_width', 'created_at', 'updated_at'
        ]


class KitchenDisplaySystemSerializer(serializers.ModelSerializer):
    kitchens = KitchenSerializer(many=True, read_only=True)
    printers = PrinterConfigurationSerializer(many=True, read_only=True)

    class Meta:
        model = KitchenDisplaySystem
        fields = [
            'id', 'restaurant', 'branch', 'is_active', 'enable_sound_alerts',
            'enable_ready_alerts', 'auto_kot_printing', 'preparation_time_default',
            'kitchens', 'printers', 'created_at', 'updated_at'
        ]


class PreparationTimerSerializer(serializers.ModelSerializer):
    elapsed_time = serializers.SerializerMethodField()
    remaining_time = serializers.SerializerMethodField()
    is_delayed = serializers.SerializerMethodField()

    class Meta:
        model = PreparationTimer
        fields = [
            'id', 'order', 'kitchen_status', 'estimated_duration',
            'started_at', 'completed_at', 'is_running',
            'elapsed_time', 'remaining_time', 'is_delayed'
        ]

    def get_elapsed_time(self, obj):
        return obj.elapsed_time

    def get_remaining_time(self, obj):
        return obj.remaining_time

    def get_is_delayed(self, obj):
        return obj.is_delayed


class KitchenOrderStatusSerializer(serializers.ModelSerializer):
    timers = PreparationTimerSerializer(many=True, read_only=True)

    class Meta:
        model = KitchenOrderStatus
        fields = [
            'id', 'order', 'kitchen', 'department', 'status',
            'started_at', 'completed_at', 'estimated_ready_time',
            'notes', 'timers', 'created_at', 'updated_at'
        ]


class KOTPrintLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = KOTPrintLog
        fields = [
            'id', 'kot', 'printer', 'printed_by', 'print_type',
            'status', 'error_message', 'printed_at'
        ]


class KitchenOrderTicketSerializer(serializers.ModelSerializer):
    print_logs = KOTPrintLogSerializer(many=True, read_only=True, source='print_logs')
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = KitchenOrderTicket
        fields = [
            'id', 'order', 'kitchen', 'department', 'kot_number',
            'status', 'items', 'print_count', 'last_printed_at',
            'special_instructions', 'item_count', 'print_logs',
            'created_at', 'updated_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderPrioritySerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = OrderPriority
        fields = ['id', 'order', 'priority', 'priority_display', 'reason', 'set_by', 'created_at', 'updated_at']


class KitchenAlertSerializer(serializers.ModelSerializer):
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)

    class Meta:
        model = KitchenAlert
        fields = [
            'id', 'kitchen', 'order', 'alert_type', 'alert_type_display',
            'message', 'is_acknowledged', 'acknowledged_by', 'acknowledged_at',
            'created_at', 'expires_at'
        ]


class KitchenOrderTicketDetailSerializer(serializers.ModelSerializer):
    """Detailed KOT view with all related information"""
    print_logs = KOTPrintLogSerializer(many=True, read_only=True)
    order_details = serializers.SerializerMethodField()
    kitchen_status = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = KitchenOrderTicket
        fields = [
            'id', 'order', 'kitchen', 'department', 'kot_number',
            'status', 'print_count', 'last_printed_at',
            'special_instructions', 'item_count', 'print_logs',
            'order_details', 'kitchen_status', 'created_at', 'updated_at'
        ]

    def get_order_details(self, obj):
        """Get order details"""
        return {
            'order_id': str(obj.order.id),
            'table_number': getattr(obj.order, 'table_number', None),
            'customer_name': getattr(obj.order, 'customer_name', None),
            'total_items': obj.items.count(),
        }

    def get_kitchen_status(self, obj):
        """Get current kitchen status"""
        try:
            status = KitchenOrderStatus.objects.filter(order=obj.order).latest('created_at')
            return KitchenOrderStatusSerializer(status).data
        except KitchenOrderStatus.DoesNotExist:
            return None

    def get_item_count(self, obj):
        return obj.items.count()


class KitchenDashboardSerializer(serializers.Serializer):
    """Serializer for kitchen dashboard summary"""
    total_pending = serializers.IntegerField()
    total_preparing = serializers.IntegerField()
    total_ready = serializers.IntegerField()
    total_delayed = serializers.IntegerField()
    pending_orders = KitchenOrderTicketSerializer(many=True)
    preparing_orders = KitchenOrderTicketSerializer(many=True)
    ready_orders = KitchenOrderTicketSerializer(many=True)
    delayed_orders = KitchenOrderTicketSerializer(many=True)


class KDSTicketSerializer(serializers.ModelSerializer):
    """Serializer for the KDS board — extends KOT with operational fields."""
    elapsed_seconds = serializers.SerializerMethodField()
    order_number = serializers.SerializerMethodField()
    table_number = serializers.SerializerMethodField()
    bumped_by_name = serializers.SerializerMethodField()
    item_details = serializers.SerializerMethodField()

    class Meta:
        model = KitchenOrderTicket
        fields = [
            'id', 'kot_number', 'order', 'order_number', 'table_number',
            'kitchen', 'department', 'status', 'course', 'order_type',
            'items', 'item_details', 'special_instructions',
            'allergy_flags', 'hold',
            'bumped_at', 'bumped_by', 'bumped_by_name',
            'recalled_at', 'created_at', 'updated_at',
            'elapsed_seconds',
        ]

    def get_elapsed_seconds(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        return int(delta.total_seconds())

    def get_order_number(self, obj):
        return getattr(obj.order, 'order_number', None)

    def get_table_number(self, obj):
        return getattr(obj.order, 'table_number', None)

    def get_bumped_by_name(self, obj):
        if obj.bumped_by:
            return f"{obj.bumped_by.first_name} {obj.bumped_by.last_name}".strip()
        return None

    def get_item_details(self, obj):
        return [
            {
                'id': str(item.id),
                'name': item.item_name,
                'quantity': item.quantity,
                'special_instructions': item.special_instructions,
            }
            for item in obj.items.all()
        ]


class KDSStatsSerializer(serializers.Serializer):
    """Serializer for KDS aggregate statistics."""
    active_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
    bumped_today = serializers.IntegerField()
    avg_prep_seconds = serializers.FloatField()
