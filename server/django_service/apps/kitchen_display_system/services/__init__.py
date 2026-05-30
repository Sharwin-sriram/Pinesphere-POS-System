"""Kitchen Display System service exports."""

from __future__ import annotations

from uuid import uuid4

from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from ..models import Kitchen, KitchenOrderStatus, KitchenOrderTicket


STATUS_MAP = {
	"NEW": "new",
	"PREPARING": "preparing",
	"READY": "ready",
	"SERVED": "served",
	"CANCELLED": "cancelled",
}


def _to_internal_status(status: str) -> str:
	mapped = STATUS_MAP.get((status or "").upper())
	if not mapped:
		raise ValidationError({"status": "Unsupported KOT status"})
	return mapped


def _next_kot_number(kitchen: Kitchen) -> str:
	ts = timezone.now().strftime("%Y%m%d%H%M%S")
	return f"KOT-{str(kitchen.id)[:4]}-{ts}-{uuid4().hex[:4].upper()}"


def auto_generate_kot(order) -> list[KitchenOrderTicket]:
	"""
	Auto-create KOT(s) for an order.

	Current schema has no station mapping on order items, so all items are routed
	to the first active kitchen.
	"""

	kitchen = Kitchen.objects.filter(is_active=True).order_by("created_at").first()
	if kitchen is None:
		raise ValidationError({"kitchen": "No active kitchen found"})

	kot = KitchenOrderTicket.objects.create(
		order=order,
		kitchen=kitchen,
		department=None,
		kot_number=_next_kot_number(kitchen),
		status="pending",
		special_instructions=order.notes or "",
	)
	item_qs = order.items.exclude(status="cancelled")
	if item_qs.exists():
		kot.items.set(item_qs)

	KitchenOrderStatus.objects.create(
		order=order,
		kitchen=kitchen,
		department=None,
		status="new",
		estimated_ready_time=timezone.now(),
		notes="Auto-generated KOT",
	)
	return [kot]


def update_kot_status(kot_id, status, staff):
	internal_status = _to_internal_status(status)
	kot = KitchenOrderTicket.objects.filter(id=kot_id).first()
	if kot is None:
		raise NotFound("KOT not found")

	latest = KitchenOrderStatus.objects.filter(order=kot.order, kitchen=kot.kitchen).order_by("-created_at").first()
	if latest is None:
		latest = KitchenOrderStatus.objects.create(
			order=kot.order,
			kitchen=kot.kitchen,
			department=kot.department,
			status=internal_status,
		)
	else:
		latest.status = internal_status
		if internal_status == "preparing":
			latest.started_at = timezone.now()
		if internal_status in {"ready", "served", "cancelled"}:
			latest.completed_at = timezone.now()
		latest.notes = f"Updated by {getattr(staff, 'id', 'system')}"
		latest.save()

	if internal_status == "preparing":
		kot.status = "printed"
	elif internal_status == "cancelled":
		kot.status = "cancelled"
	kot.save(update_fields=["status", "updated_at"])
	return latest


def reprint_kot(kot_id) -> dict:
	kot = KitchenOrderTicket.objects.filter(id=kot_id).first()
	if kot is None:
		raise NotFound("KOT not found")

	kot.print_count += 1
	kot.last_printed_at = timezone.now()
	kot.status = "reprinted"
	kot.save(update_fields=["print_count", "last_printed_at", "status", "updated_at"])

	return {
		"kot_id": str(kot.id),
		"kot_number": kot.kot_number,
		"order_id": str(kot.order_id),
		"kitchen_id": str(kot.kitchen_id),
		"items": [
			{
				"order_item_id": str(item.id),
				"name": item.item_name,
				"qty": item.quantity,
				"notes": item.special_instructions,
			}
			for item in kot.items.all()
		],
		"special_instructions": kot.special_instructions or "",
		"print_count": kot.print_count,
	}

