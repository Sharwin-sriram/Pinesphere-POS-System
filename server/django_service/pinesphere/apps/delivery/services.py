from django.db import transaction
from django.utils import timezone
from . import models


def create_delivery(order_id: int, payload: dict) -> models.Delivery:
    with transaction.atomic():
        delivery = models.Delivery.objects.create(
            order_id=order_id,
            restaurant_id=payload.get('restaurant_id'),
            branch_id=payload.get('branch_id'),
            pickup_address=payload.get('pickup_address'),
            dropoff_address=payload.get('dropoff_address'),
            eta=payload.get('eta'),
            tracking_id=payload.get('tracking_id'),
            courier_contact=payload.get('courier_contact'),
            notes=payload.get('notes'),
            metadata=payload.get('metadata') or {},
        )
        return delivery


def assign_courier(delivery: models.Delivery, courier: models.DeliveryCourier) -> models.Delivery:
    delivery.courier = courier
    delivery.assigned_at = timezone.now()
    delivery.status = models.Delivery.STATUS_ASSIGNED
    delivery.courier_contact = courier.phone
    delivery.save(update_fields=['courier', 'assigned_at', 'status', 'courier_contact', 'updated_at'])
    log_event(delivery, 'status_change', payload={'status': delivery.status})
    return delivery


def update_status(delivery: models.Delivery, new_status: str) -> models.Delivery:
    delivery.status = new_status
    if new_status == models.Delivery.STATUS_PICKED:
        delivery.picked_at = timezone.now()
    if new_status == models.Delivery.STATUS_DELIVERED:
        delivery.delivered_at = timezone.now()
    delivery.save(update_fields=['status', 'picked_at', 'delivered_at', 'updated_at'])
    log_event(delivery, 'status_change', payload={'status': new_status})
    return delivery


def log_event(delivery: models.Delivery, event_type: str, location: dict = None, payload: dict = None) -> models.DeliveryEvent:
    ev = models.DeliveryEvent.objects.create(delivery=delivery, event_type=event_type, location=location or {}, payload=payload or {})
    return ev
