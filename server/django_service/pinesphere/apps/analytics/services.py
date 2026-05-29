from django.db.models import Sum, F, Count
from django.db.models.functions import TruncDate
from decimal import Decimal
from pinesphere.core.exceptions import ServiceError
from pinesphere.apps.billing.models import Order, Payment, Refund, OrderItem, MenuItem


def get_daily_sales(branch, date):
    qs = Order.objects.filter(branch=branch, created_at__date=date, deleted_at__isnull=True, status='CLOSED')
    total = qs.aggregate(total=Sum('net_total'))['total'] or Decimal('0.00')
    by_payment = Payment.objects.filter(order__in=qs, deleted_at__isnull=True).values('mode').annotate(amount=Sum('amount'))
    refunds = Refund.objects.filter(payment__order__in=qs, deleted_at__isnull=True).aggregate(total_refunds=Sum('amount'))['total_refunds'] or Decimal('0.00')
    tax_collected = qs.aggregate(tax=Sum('tax_total'))['tax'] or Decimal('0.00')
    return {'date': str(date), 'total_sales': total, 'by_payment_mode': list(by_payment), 'tax_collected': tax_collected, 'refunds': refunds}


def get_shift_summary(shift_id):
    # Placeholder: assume Shift model exists with start_time/end_time
    try:
        from employees.models import Shift
    except Exception:
        raise ServiceError('shift_model_missing', 'Shift model not available')
    try:
        shift = Shift.objects.get(id=shift_id)
    except Shift.DoesNotExist:
        raise ServiceError('shift_not_found', 'Shift not found', status_code=404)

    qs = Order.objects.filter(branch=shift.branch, created_at__gte=shift.start_time, created_at__lte=shift.end_time, deleted_at__isnull=True, status='CLOSED')
    total = qs.aggregate(total=Sum('net_total'))['total'] or Decimal('0.00')
    orders_count = qs.count()
    refunds = Refund.objects.filter(payment__order__in=qs, deleted_at__isnull=True).aggregate(total_refunds=Sum('amount'))['total_refunds'] or Decimal('0.00')
    return {'shift_id': shift_id, 'orders_count': orders_count, 'revenue': total, 'refunds': refunds}


def get_top_items(branch, from_date, to_date, limit=10):
    items = (
        OrderItem.objects.filter(order__branch=branch, order__created_at__date__gte=from_date, order__created_at__date__lte=to_date, deleted_at__isnull=True)
        .values('menu_item')
        .annotate(qty_sold=Sum('qty'), revenue=Sum(F('qty') * F('price')))
        .order_by('-qty_sold')[:limit]
    )
    # attach names
    results = []
    for it in items:
        mi = MenuItem.objects.filter(id=it['menu_item']).first()
        results.append({'menu_item_id': it['menu_item'], 'name': mi.name if mi else None, 'qty_sold': it['qty_sold'], 'revenue': it['revenue']})
    return results
