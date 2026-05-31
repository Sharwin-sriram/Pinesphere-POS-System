from django.contrib import admin
from . import models


@admin.register(models.PaymentGateway)
class PaymentGatewayAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'active')


@admin.register(models.Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'amount', 'status', 'created_at')


@admin.register(models.SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'interval', 'active')


@admin.register(models.Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'plan', 'status', 'started_at')


@admin.register(models.Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'amount', 'issued_at', 'status')


@admin.register(models.Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "razorpay_order_id", "razorpay_payment_id", "amount", "status", "created_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("id", "customer__mobile", "customer__email", "razorpay_order_id", "razorpay_payment_id")
    readonly_fields = (
        "id",
        "customer",
        "razorpay_order_id",
        "razorpay_payment_id",
        "amount",
        "currency",
        "status",
        "receipt",
        "notes",
        "idempotency_key",
        "metadata",
        "created_at",
        "updated_at",
    )


@admin.register(models.PaymentEvent)
class PaymentEventAdmin(admin.ModelAdmin):
    list_display = ("id", "payment", "event", "received_at")
    list_filter = ("event", "received_at")
    search_fields = ("payment__id", "payment__razorpay_order_id", "event")
    readonly_fields = ("id", "payment", "event", "payload", "received_at")

