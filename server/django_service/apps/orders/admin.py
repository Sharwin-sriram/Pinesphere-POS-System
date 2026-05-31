from django.contrib import admin
from .models import Order, OrderItem


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'restaurant', 'status', 'customer_name', 'customer_phone', 'total_amount', 'created_at')
    list_filter = ('status', 'restaurant', 'created_at')
    search_fields = ('order_number', 'customer_name', 'customer_phone')
    readonly_fields = ('id', 'order_number', 'created_at', 'updated_at')
    fieldsets = (
        ('Order Info', {
            'fields': ('id', 'order_number', 'restaurant', 'status')
        }),
        ('Customer Info', {
            'fields': ('customer_name', 'customer_phone')
        }),
        ('Order Details', {
            'fields': ('total_amount', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'order', 'quantity', 'unit_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('item_name', 'order__order_number')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Item Info', {
            'fields': ('id', 'order', 'item_name', 'status')
        }),
        ('Quantity & Price', {
            'fields': ('quantity', 'unit_price')
        }),
        ('Instructions', {
            'fields': ('special_instructions',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
