from django.db import transaction
from django.utils import timezone
from pinesphere.core.exceptions import ServiceError
from .models import KOT, KOTItem, KitchenStation, KOTReprintLog
from pinesphere.apps.billing.models import OrderItem


def auto_generate_kot(order):
    # naive routing: all items to default station (None) for now
    if not order.items.filter(deleted_at__isnull=True).exists():
        raise ServiceError('no_order_items', 'Order has no items')

    kot = KOT.objects.create(order=order, kot_number=f"KOT-{order.id}-{int(timezone.now().timestamp())}", branch=order.branch, station=None, created_by=order.created_by)
    for it in order.items.filter(deleted_at__isnull=True):
        KOTItem.objects.create(kot=kot, order_item=it, menu_item=it.menu_item, qty=it.qty, modifiers=it.modifiers)
    return [kot]


def update_kot_status(kot_id, status, staff=None):
    try:
        kot = KOT.objects.get(id=kot_id, deleted_at__isnull=True)
    except KOT.DoesNotExist:
        raise ServiceError('kot_not_found', 'KOT not found', status_code=404)
    if status not in dict(KOT.STATUS):
        raise ServiceError('invalid_status', 'Invalid KOT status')
    kot.status = status
    kot.save()
    # update items accordingly if moving to READY/SERVED
    if status == 'CANCELLED':
        kot.items.update(status='CANCELLED')
    return kot


def reprint_kot(kot_id, requested_by=None, reason=None):
    try:
        kot = KOT.objects.get(id=kot_id)
    except KOT.DoesNotExist:
        raise ServiceError('kot_not_found', 'KOT not found', status_code=404)
    kot.printed_count += 1
    kot.save()
    KOTReprintLog.objects.create(kot=kot, requested_by=requested_by, reason=reason)
    # Return data dict for thermal printer
    items = []
    for it in kot.items.filter(deleted_at__isnull=True):
        items.append({'name': it.menu_item.name, 'qty': it.qty, 'modifiers': it.modifiers, 'notes': it.notes})
    return {'kot': {'id': kot.id, 'kot_number': kot.kot_number, 'station': kot.station_id, 'items': items}}


def cancel_kot(kot_id, cancelled_by=None):
    try:
        kot = KOT.objects.get(id=kot_id, deleted_at__isnull=True)
    except KOT.DoesNotExist:
        raise ServiceError('kot_not_found', 'KOT not found', status_code=404)
    kot.status = 'CANCELLED'
    kot.deleted_at = timezone.now()
    kot.save()
    kot.items.update(status='CANCELLED', deleted_at=timezone.now())
    return kot
