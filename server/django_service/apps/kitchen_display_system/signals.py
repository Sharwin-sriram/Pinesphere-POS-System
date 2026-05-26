"""
Signals for Kitchen Display System - Handles automatic actions on model changes
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import (
    KitchenOrderStatus,
    KitchenOrderTicket,
    PreparationTimer,
    OrderPriority,
)
from .services.printer_service import PrinterService
from .services.alert_service import AlertService
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=KitchenOrderTicket)
def handle_kot_created(sender, instance, created, **kwargs):
    """
    Signal handler for when a KOT is created
    - Auto-print KOT if enabled
    - Create new order alert
    """
    if created:
        try:
            # Auto-print KOT if enabled
            if instance.kitchen.kds.auto_kot_printing:
                PrinterService.auto_print_kot(instance, instance.kitchen.kds)
            
            # Create new order alert
            AlertService.create_new_order_alert(instance.order, instance.kitchen)
            
            logger.info(f"KOT created and processed: {instance.kot_number}")
        except Exception as e:
            logger.error(f"Error handling KOT creation: {str(e)}")


@receiver(post_save, sender=KitchenOrderStatus)
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    Signal handler for when order status changes
    - Send alerts based on status
    - Update timers
    """
    try:
        if instance.status == 'ready':
            # Create ready alert
            AlertService.create_ready_alert(instance.order, instance.kitchen)
        
        elif instance.status == 'delayed':
            # Create delay alert
            AlertService.create_delay_alert(instance.order, instance.kitchen)
        
        logger.info(f"Order status updated: {instance.order.id} -> {instance.status}")
    except Exception as e:
        logger.error(f"Error handling order status change: {str(e)}")


@receiver(pre_save, sender=PreparationTimer)
def handle_timer_update(sender, instance, **kwargs):
    """
    Signal handler for timer updates
    - Check if timer exceeded estimated duration
    """
    try:
        if instance.is_running and instance.is_delayed:
            # Mark order as delayed if timer exceeded
            from .models import KitchenOrderStatus
            try:
                order_status = KitchenOrderStatus.objects.get(
                    order=instance.order,
                    kitchen_status__id=instance.kitchen_status.id
                )
                if order_status.status not in ['delayed', 'ready', 'served']:
                    order_status.status = 'delayed'
                    order_status.save()
            except KitchenOrderStatus.DoesNotExist:
                pass
    except Exception as e:
        logger.error(f"Error handling timer update: {str(e)}")


@receiver(post_save, sender=OrderPriority)
def handle_priority_change(sender, instance, created, **kwargs):
    """
    Signal handler for order priority changes
    - Log priority changes
    """
    if not created:
        logger.info(
            f"Order priority changed: {instance.order.id} "
            f"-> {instance.get_priority_display()}"
        )
