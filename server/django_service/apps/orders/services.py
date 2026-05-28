"""Business logic for order/billing operations."""

from __future__ import annotations

from decimal import Decimal
from io import BytesIO
from uuid import uuid4

from django.db import transaction
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from rest_framework.exceptions import APIException, NotFound, ValidationError

from .models import Order, OrderItem


class BillingNotImplemented(APIException):
    status_code = 501
    default_code = "billing_not_implemented"
    default_detail = "Requested billing feature is not available in current schema."


def _next_order_number() -> str:
    return f"ORD-{uuid4().hex[:10].upper()}"


def get_order_or_404(order_id: str) -> Order:
    order = Order.objects.filter(id=order_id).first()
    if order is None:
        raise NotFound("Order not found")
    return order


def tenant_scoped_orders_for_user(user):
    """
    Return a scoped queryset for the current user.

    NOTE: current order schema has no restaurant/branch FK, so this is a best-effort
    scope for now: customer role sees own phone-linked orders; staff sees all.
    """

    queryset = Order.objects.all().order_by("-created_at")
    if getattr(user, "role", None) == "CUSTOMER":
        queryset = queryset.filter(customer_phone=getattr(user, "mobile", ""))
    return queryset


@transaction.atomic
def create_order(tenant, branch, order_type, table_id, items) -> Order:
    # tenant/branch/order_type/table_id kept for API contract compatibility.
    order = Order.objects.create(
        order_number=_next_order_number(),
        status="pending",
        notes=f"order_type={order_type or ''}; table_id={table_id or ''}",
    )
    for item in items or []:
        add_item(
            order=order,
            menu_item_id=item.get("menu_item_id") or item.get("item_name") or "ITEM",
            qty=item.get("qty", 1),
            modifiers=item.get("modifiers"),
            notes=item.get("notes", ""),
            unit_price=item.get("unit_price", 0),
        )
    totals = calculate_totals(order)
    order.total_amount = totals["net_total"]
    order.save(update_fields=["total_amount", "updated_at"])
    return order


@transaction.atomic
def add_item(order, menu_item_id, qty, modifiers, notes, unit_price=0) -> OrderItem:
    if qty <= 0:
        raise ValidationError({"qty": "Quantity must be greater than 0"})
    item_name = str(menu_item_id)
    modifier_text = f" modifiers={modifiers}" if modifiers else ""
    item = OrderItem.objects.create(
        order=order,
        item_name=item_name,
        quantity=qty,
        unit_price=Decimal(str(unit_price or 0)),
        special_instructions=f"{notes or ''}{modifier_text}".strip(),
        status="pending",
    )
    totals = calculate_totals(order)
    order.total_amount = totals["net_total"]
    order.save(update_fields=["total_amount", "updated_at"])
    return item


@transaction.atomic
def void_item(order, order_item_id, reason) -> OrderItem:
    item = order.items.filter(id=order_item_id).first()
    if item is None:
        raise NotFound("Order item not found")
    item.status = "cancelled"
    item.special_instructions = f"{item.special_instructions or ''}\nVOID_REASON: {reason or 'N/A'}".strip()
    item.save(update_fields=["status", "special_instructions", "updated_at"])
    totals = calculate_totals(order)
    order.total_amount = totals["net_total"]
    order.save(update_fields=["total_amount", "updated_at"])
    return item


def calculate_totals(order) -> dict:
    active_items = order.items.exclude(status="cancelled")
    subtotal = sum((item.unit_price * item.quantity for item in active_items), Decimal("0.00"))
    # Schema currently has no tax/service charge tables; keep deterministic placeholder.
    tax = Decimal("0.00")
    service_charge = Decimal("0.00")
    discount = Decimal("0.00")
    net_total = subtotal + tax + service_charge - discount
    return {
        "subtotal": subtotal,
        "tax": tax,
        "service_charge": service_charge,
        "discount": discount,
        "net_total": net_total,
    }


@transaction.atomic
def apply_discount(order, discount_type, value, reason) -> Order:
    # No discount persistence fields in schema; apply as note for audit trail.
    order.notes = f"{order.notes or ''}\nDISCOUNT {discount_type}: {value} ({reason or 'N/A'})".strip()
    order.save(update_fields=["notes", "updated_at"])
    return order


def apply_coupon(order, coupon_code) -> Order:
    # Coupon model not present in schema.
    raise BillingNotImplemented("Coupon support is not available in the current data model.")


@transaction.atomic
def process_payment(order, payment_lines) -> dict:
    # Payment model not present in schema; close order as paid-like flow signal.
    if not payment_lines:
        raise ValidationError({"payment_lines": "At least one payment line is required"})
    order.status = "served"
    order.save(update_fields=["status", "updated_at"])
    return {
        "order_id": str(order.id),
        "status": "processed",
        "payment_lines": payment_lines,
        "total_amount": str(order.total_amount),
    }


def process_refund(payment_id, amount, reason):
    # Refund model not present in schema.
    raise BillingNotImplemented("Refund support is not available in the current data model.")


def generate_gst_invoice_pdf(order) -> bytes:
    """
    Generate a simple invoice PDF from current order schema.

    This is a placeholder-compatible GST invoice until tax fields are available.
    """

    stream = BytesIO()
    pdf = canvas.Canvas(stream, pagesize=A4)
    width, height = A4

    y = height - 50
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Pinesphere POS - Invoice")
    y -= 25

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, y, f"Order #: {order.order_number}")
    y -= 18
    pdf.drawString(50, y, f"Status: {order.status}")
    y -= 18
    pdf.drawString(50, y, f"Customer: {order.customer_name or '-'}")
    y -= 18
    pdf.drawString(50, y, f"Phone: {order.customer_phone or '-'}")
    y -= 28

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(50, y, "Items")
    y -= 18
    pdf.setFont("Helvetica", 10)
    for item in order.items.all():
        pdf.drawString(
            60,
            y,
            f"{item.item_name} x {item.quantity} @ {item.unit_price} [{item.status}]",
        )
        y -= 15
        if y < 100:
            pdf.showPage()
            y = height - 50

    totals = calculate_totals(order)
    y -= 10
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(50, y, f"Subtotal: {totals['subtotal']}")
    y -= 18
    pdf.drawString(50, y, f"Tax: {totals['tax']}")
    y -= 18
    pdf.drawString(50, y, f"Net Total: {totals['net_total']}")

    pdf.showPage()
    pdf.save()
    return stream.getvalue()

