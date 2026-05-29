from django.db import transaction
from decimal import Decimal
from django.utils import timezone
from . import models


def _safe_decimal(value) -> Decimal:
    try:
        return Decimal(str(value))
    except Exception:
        return Decimal('0')


def create_order(payload: dict, user=None) -> models.Order:
    """Create an Order and its items, compute totals, and call optional hooks.

    This function handles:
    - creating the order record
    - creating order items and calculating subtotal
    - updating order totals
    - attempting to call inventory and billing integrations if present
    """
    items_payload = payload.get('items', []) or []
    restaurant_id = payload.get('restaurant_id') or getattr(user, 'restaurant_id', None)
    branch_id = payload.get('branch_id') or getattr(user, 'branch_id', None)

    with transaction.atomic():
        order = models.Order.objects.create(
            external_id=payload.get('external_id'),
            restaurant_id=restaurant_id,
            branch_id=branch_id,
            customer_id=payload.get('customer_id'),
            status=payload.get('status', models.Order.STATUS_PENDING),
            source=payload.get('source', models.Order.SOURCE_WEB),
            delivery_type=payload.get('delivery_type', models.Order.DELIVERY_PICKUP),
            delivery_address=payload.get('delivery_address'),
            scheduled_at=payload.get('scheduled_at'),
            total_amount=Decimal('0'),
            currency=payload.get('currency', 'INR'),
            metadata=payload.get('metadata') or {},
        )

        subtotal = Decimal('0')
        for it in items_payload:
            oi = add_order_item(order, it)
            subtotal += _safe_decimal(oi.total_price)

        # compute simple totals (taxes, discounts, delivery fees are placeholders)
        totals = {'subtotal': subtotal, 'tax': Decimal('0'), 'discount': Decimal('0'), 'delivery_fee': Decimal('0')}
        total = totals['subtotal'] + totals['tax'] + totals['delivery_fee'] - totals['discount']
        order.total_amount = total
        order.save(update_fields=['total_amount', 'updated_at'])

        # Optional: call inventory deduction hook
        try:
            from pinesphere.apps.inventory import services as inventory_services

            try:
                inventory_services.deduct_stock_on_order(order)
            except Exception:
                # inventory deduction failed — do not break order creation
                pass
        except Exception:
            pass

        # Optional: create billing order if billing service exposes a create_order hook
        try:
            from pinesphere.apps.billing import services as billing_services

            try:
                # best-effort mapping; billing service may accept different schema
                billing_payload = {
                    'order_id': order.id,
                    'branch_id': branch_id,
                    'restaurant_id': restaurant_id,
                    'amount': str(order.total_amount),
                    'currency': order.currency,
                    'items': [
                        {
                            'name': it.name,
                            'quantity': it.quantity,
                            'unit_price': str(it.unit_price),
                            'total_price': str(it.total_price),
                        }
                        for it in order.items.all()
                    ],
                }
                # billing_services.create_order may raise if signature differs
                try:
                    billing_services.create_order(billing_payload, user=user)
                except TypeError:
                    # fallback: try with only order id
                    try:
                        billing_services.create_order(order.id)
                    except Exception:
                        pass
            except Exception:
                pass
        except Exception:
            pass

        return order


def update_order_status(order: models.Order, new_status: str, changed_by=None) -> models.Order:
    order.status = new_status
    order.updated_at = timezone.now()
    order.save(update_fields=['status', 'updated_at'])
    return order


def add_order_item(order: models.Order, item_payload: dict) -> models.OrderItem:
    unit_price = _safe_decimal(item_payload.get('unit_price', 0))
    quantity = int(item_payload.get('quantity', 1) or 1)

    # modifiers may be a list of dicts with price, or a dict
    modifiers = item_payload.get('modifiers') or {}
    modifier_total = Decimal('0')
    if isinstance(modifiers, list):
        for m in modifiers:
            modifier_total += _safe_decimal(m.get('price', 0))
    elif isinstance(modifiers, dict):
        # if dict, sum numeric values
        for v in modifiers.values():
            modifier_total += _safe_decimal(v)

    calculated_total = (unit_price * quantity) + modifier_total

    item = models.OrderItem.objects.create(
        order=order,
        menu_item_id=item_payload.get('menu_item_id'),
        menu_item_snapshot=item_payload.get('menu_item_snapshot'),
        name=item_payload.get('name') or (item_payload.get('menu_item_snapshot') or {}).get('name', 'Item'),
        quantity=quantity,
        unit_price=unit_price,
        modifiers=modifiers,
        total_price=item_payload.get('total_price') or calculated_total,
    )
    return item


def calculate_totals(order: models.Order) -> dict:
    items = order.items.all()
    subtotal = sum([_safe_decimal(it.total_price) for it in items])
    return {'subtotal': subtotal, 'total': subtotal}


def create_payment_reference(order: models.Order, amount: float, provider: str = None) -> models.PaymentReference:
    pr = models.PaymentReference.objects.create(order=order, amount=_safe_decimal(amount), provider=provider or 'unknown')
    return pr
