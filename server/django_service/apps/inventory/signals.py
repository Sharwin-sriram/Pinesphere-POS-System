from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PurchaseOrder


@receiver(post_save, sender=PurchaseOrder)
def purchase_order_received(sender, instance, created, **kwargs):

    if instance.status == 'Received':

        inventory_item = instance.inventory_item

        inventory_item.quantity += instance.quantity

        inventory_item.save()