from .models import Inventory


def update_stock(inventory_item, quantity, movement_type):

    if movement_type == 'IN':
        inventory_item.quantity += quantity

    elif movement_type in ['OUT', 'WASTAGE']:
        inventory_item.quantity -= quantity

    inventory_item.save()


def is_low_stock(inventory_item):

    return inventory_item.quantity <= inventory_item.reorder_level