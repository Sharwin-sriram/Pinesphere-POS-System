from django.contrib import admin
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


@admin.register(KitchenDisplaySystem)
class KitchenDisplaySystemAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'branch', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('restaurant__name', 'branch__name')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Kitchen)
class KitchenAdmin(admin.ModelAdmin):
    list_display = ('name', 'kitchen_type', 'is_active', 'created_at')
    list_filter = ('is_active', 'kitchen_type', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(KitchenDepartment)
class KitchenDepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'kitchen', 'display_order', 'is_active')
    list_filter = ('is_active', 'kitchen')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ['kitchen', 'display_order']


@admin.register(KitchenOrderStatus)
class KitchenOrderStatusAdmin(admin.ModelAdmin):
    list_display = ('order', 'kitchen', 'status', 'started_at', 'completed_at')
    list_filter = ('status', 'created_at', 'kitchen')
    search_fields = ('order__id',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ['-created_at']


@admin.register(KitchenOrderTicket)
class KitchenOrderTicketAdmin(admin.ModelAdmin):
    list_display = ('kot_number', 'order', 'kitchen', 'status', 'print_count', 'created_at')
    list_filter = ('status', 'created_at', 'kitchen')
    search_fields = ('kot_number', 'order__id')
    readonly_fields = ('id', 'kot_number', 'created_at', 'updated_at')
    ordering = ['-created_at']


@admin.register(PreparationTimer)
class PreparationTimerAdmin(admin.ModelAdmin):
    list_display = ('order', 'estimated_duration', 'elapsed_time', 'is_running', 'is_delayed')
    list_filter = ('is_running', 'started_at')
    search_fields = ('order__id',)
    readonly_fields = ('elapsed_time', 'remaining_time', 'is_delayed')


@admin.register(PrinterConfiguration)
class PrinterConfigurationAdmin(admin.ModelAdmin):
    list_display = ('name', 'printer_type', 'connection_type', 'is_active', 'is_default')
    list_filter = ('is_active', 'is_default', 'printer_type', 'connection_type')
    search_fields = ('name', 'printer_address')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(KOTPrintLog)
class KOTPrintLogAdmin(admin.ModelAdmin):
    list_display = ('kot', 'printer', 'print_type', 'status', 'printed_at')
    list_filter = ('print_type', 'status', 'printed_at')
    search_fields = ('kot__kot_number',)
    readonly_fields = ('id', 'printed_at')
    ordering = ['-printed_at']


@admin.register(OrderPriority)
class OrderPriorityAdmin(admin.ModelAdmin):
    list_display = ('order', 'priority', 'reason', 'set_by', 'created_at')
    list_filter = ('priority', 'created_at')
    search_fields = ('order__id', 'reason')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(KitchenAlert)
class KitchenAlertAdmin(admin.ModelAdmin):
    list_display = ('get_alert_type_display', 'order', 'kitchen', 'is_acknowledged', 'created_at')
    list_filter = ('alert_type', 'is_acknowledged', 'created_at')
    search_fields = ('message', 'order__id')
    readonly_fields = ('id', 'created_at')
    ordering = ['-created_at']
