from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from pinesphere.core.exceptions import ServiceError
from .models import InventoryItem, PurchaseOrder, PurchaseOrderItem, StockAdjustment, StockTransfer, StockLedger
from pinesphere.apps.billing.models import Order
from django.db.models import F


def deduct_stock_on_order(order: Order):
    # naive: reduce stock by OrderItem.qty for matching InventoryItem with same menu_item name
    for oi in order.items.filter(deleted_at__isnull=True):
        try:
            inv = InventoryItem.objects.get(branch=order.branch, name=oi.menu_item.name, deleted_at__isnull=True)
        except InventoryItem.DoesNotExist:
            raise ServiceError('inventory_item_not_found', f'Inventory item for {oi.menu_item.name} not found')
        if inv.current_stock < oi.qty:
            raise ServiceError('insufficient_stock', f'Insufficient stock for {inv.name}')
        inv.current_stock = F('current_stock') - oi.qty
        inv.save()
        inv.refresh_from_db()
        StockLedger.objects.create(inventory_item=inv, branch=inv.branch, change_type='ORDER', qty=-oi.qty, balance_after=inv.current_stock, ref_id=order.id)
    return True


@transaction.atomic
def receive_grn(purchase_order: PurchaseOrder, items_received: list):
    if purchase_order.status != 'OPEN':
        raise ServiceError('po_not_open', 'Purchase order not open for GRN')
    for rec in items_received:
        poi = PurchaseOrderItem.objects.get(purchase_order=purchase_order, id=rec['po_item_id'])
        qty = Decimal(rec['qty_received'])
        poi.qty_received = F('qty_received') + qty
        poi.save()
        poi.refresh_from_db()
        inv = poi.inventory_item
        inv.current_stock = F('current_stock') + qty
        inv.save()
        inv.refresh_from_db()
        StockLedger.objects.create(inventory_item=inv, branch=inv.branch, change_type='GRN', qty=qty, balance_after=inv.current_stock, ref_id=purchase_order.id)

    purchase_order.status = 'GRN_RECEIVED'
    purchase_order.save()
    return True


def check_low_stock(branch):
    items = InventoryItem.objects.filter(branch=branch, deleted_at__isnull=True, current_stock__lte=F('reorder_level'))
    return list(items.values('id', 'name', 'current_stock', 'reorder_level'))


@transaction.atomic
def transfer_stock(from_branch, to_branch, item_id, qty, created_by=None):
    try:
        inv = InventoryItem.objects.get(id=item_id, branch=from_branch, deleted_at__isnull=True)
    except InventoryItem.DoesNotExist:
        raise ServiceError('inventory_item_not_found', 'Item not found in source branch')
    if inv.current_stock < Decimal(qty):
        raise ServiceError('insufficient_stock', 'Not enough stock to transfer')

    inv.current_stock = F('current_stock') - Decimal(qty)
    inv.save()
    inv.refresh_from_db()
    # ensure item exists in target branch
    target_inv, _ = InventoryItem.objects.get_or_create(restaurant=inv.restaurant, branch=to_branch, name=inv.name, defaults={'uom': inv.uom, 'current_stock': 0, 'reorder_level': inv.reorder_level, 'avg_cost': inv.avg_cost})
    target_inv.current_stock = F('current_stock') + Decimal(qty)
    target_inv.save()
    target_inv.refresh_from_db()

    st = StockTransfer.objects.create(from_branch=from_branch, to_branch=to_branch, inventory_item=inv, qty=Decimal(qty), status='RECEIVED', created_by=created_by)
    StockLedger.objects.create(inventory_item=inv, branch=inv.branch, change_type='TRANSFER_OUT', qty=-Decimal(qty), balance_after=inv.current_stock, ref_id=st.id)
    StockLedger.objects.create(inventory_item=target_inv, branch=target_inv.branch, change_type='TRANSFER_IN', qty=Decimal(qty), balance_after=target_inv.current_stock, ref_id=st.id)
    return st
