from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from pinesphere.core.exceptions import ServiceError
from .models import Order, OrderItem, MenuItem, Payment, Refund, Coupon, Branch


def _get_menu_item(menu_item_id):
    try:
        return MenuItem.objects.get(id=menu_item_id, deleted_at__isnull=True, is_active=True)
    except MenuItem.DoesNotExist:
        raise ServiceError('menu_item_not_found', f'MenuItem {menu_item_id} not found', status_code=404)


@transaction.atomic
def create_order(tenant, branch, order_type, table_id=None, items=None, customer=None, created_by=None):
    if not items:
        raise ServiceError('no_items', 'Order must contain at least one item')

    order = Order.objects.create(
        restaurant=tenant,
        branch=branch,
        table_id=table_id,
        customer=customer,
        order_type=order_type,
        created_by=created_by,
    )

    for it in items:
        menu_item = _get_menu_item(it['menu_item_id'])
        price = menu_item.price
        qty = int(it['qty'])
        OrderItem.objects.create(
            order=order,
            menu_item=menu_item,
            qty=qty,
            price=price,
            tax=Decimal('0.00'),
            modifiers=it.get('modifiers'),
            notes=it.get('notes'),
        )

    calculate_totals(order)
    order.save()
    return order


def add_item(order, menu_item_id, qty, modifiers=None, notes=None):
    if order.status != 'OPEN':
        raise ServiceError('order_not_open', 'Cannot add items to non-open order')
    menu_item = _get_menu_item(menu_item_id)
    oi = OrderItem.objects.create(order=order, menu_item=menu_item, qty=qty, price=menu_item.price, tax=Decimal('0.00'), modifiers=modifiers, notes=notes)
    calculate_totals(order)
    order.save()
    return oi


def void_item(order, order_item_id, reason=None):
    try:
        oi = OrderItem.objects.get(id=order_item_id, order=order, deleted_at__isnull=True)
    except OrderItem.DoesNotExist:
        raise ServiceError('order_item_not_found', 'Order item not found', status_code=404)
    oi.status = 'VOIDED'
    oi.deleted_at = timezone.now()
    oi.save()
    calculate_totals(order)
    order.save()
    return oi


def calculate_totals(order):
    items = order.items.filter(deleted_at__isnull=True)
    subtotal = Decimal('0.00')
    tax_total = Decimal('0.00')
    for it in items:
        line = it.price * it.qty
        subtotal += line
        # naive tax calc: use menu_item.tax_profile if present
        if it.menu_item and it.menu_item.tax_profile:
            tp = it.menu_item.tax_profile
            # assume intra-state: use cgst+sgst
            tax_pct = (tp.cgst_percent + tp.sgst_percent) / Decimal('100')
            tax_amount = (line * tax_pct).quantize(Decimal('0.01'))
        else:
            tax_amount = Decimal('0.00')
        it.tax = tax_amount
        it.save()
        tax_total += tax_amount

    service_charge = (subtotal * (order.branch.service_charge_percent or Decimal('0')) / Decimal('100')).quantize(Decimal('0.01'))
    discount_total = getattr(order, 'discount_total', Decimal('0.00')) or Decimal('0.00')
    net_total = (subtotal + tax_total + service_charge - discount_total).quantize(Decimal('0.01'))

    order.subtotal = subtotal
    order.tax_total = tax_total
    order.service_charge = service_charge
    order.discount_total = discount_total
    order.net_total = net_total
    order.save()

    return {
        'subtotal': subtotal,
        'tax_total': tax_total,
        'service_charge': service_charge,
        'discount_total': discount_total,
        'net_total': net_total,
    }


def apply_discount(order, discount_type, value, reason=None):
    if discount_type not in ('PERCENT', 'FIXED'):
        raise ServiceError('invalid_discount', 'Invalid discount type')
    if discount_type == 'PERCENT':
        discount = (order.subtotal * Decimal(value) / Decimal('100')).quantize(Decimal('0.01'))
    else:
        discount = Decimal(value)
    order.discount_total = discount
    calculate_totals(order)
    order.save()
    return order


def apply_coupon(order, coupon_code):
    try:
        coupon = Coupon.objects.get(code=coupon_code, active=True)
    except Coupon.DoesNotExist:
        raise ServiceError('invalid_coupon', 'Coupon not valid', status_code=404)
    now = timezone.now()
    if not (coupon.valid_from <= now <= coupon.valid_to):
        raise ServiceError('coupon_expired', 'Coupon not valid at this time')
    if coupon.min_order_value and order.subtotal < coupon.min_order_value:
        raise ServiceError('coupon_minimum', 'Order does not meet minimum value for coupon')

    if coupon.discount_type == 'PERCENT':
        discount = (order.subtotal * coupon.value / Decimal('100')).quantize(Decimal('0.01'))
    else:
        discount = coupon.value

    order.discount_total = discount
    calculate_totals(order)
    order.save()
    return order


@transaction.atomic
def process_payment(order, payment_lines, processed_by=None):
    if order.status != 'OPEN':
        raise ServiceError('order_not_open', 'Order not open for payment')
    total_paid = Decimal('0.00')
    created_payments = []
    for p in payment_lines:
        mode = p.get('mode')
        amount = Decimal(p.get('amount'))
        reference = p.get('reference')
        pay = Payment.objects.create(order=order, amount=amount, mode=mode, reference=reference, processed_by=processed_by)
        created_payments.append(pay)
        total_paid += amount

    if total_paid < order.net_total:
        raise ServiceError('insufficient_payment', 'Total payment less than order amount')

    order.status = 'CLOSED'
    order.save()
    return created_payments


def process_refund(payment_id, amount, reason=None, processed_by=None):
    try:
        payment = Payment.objects.get(id=payment_id, deleted_at__isnull=True)
    except Payment.DoesNotExist:
        raise ServiceError('payment_not_found', 'Payment not found', status_code=404)

    if Decimal(amount) > payment.amount:
        raise ServiceError('invalid_refund', 'Refund amount greater than payment')

    refund = Refund.objects.create(payment=payment, amount=Decimal(amount), reason=reason, processed_by=processed_by)
    return refund


def generate_gst_invoice_pdf(order):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        import io
    except Exception:
        raise ServiceError('reportlab_missing', 'ReportLab library is required to generate PDFs')

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    c.drawString(50, 800, f"Invoice for Order #{order.id}")
    y = 770
    for it in order.items.filter(deleted_at__isnull=True):
        c.drawString(50, y, f"{it.menu_item.name} x{it.qty} - {it.price}")
        y -= 15

    c.drawString(50, y - 20, f"Subtotal: {order.subtotal}")
    c.drawString(50, y - 40, f"Tax: {order.tax_total}")
    c.drawString(50, y - 60, f"Service: {order.service_charge}")
    c.drawString(50, y - 80, f"Net: {order.net_total}")
    c.showPage()
    c.save()
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
