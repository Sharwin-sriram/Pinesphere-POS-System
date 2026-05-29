from django.utils import timezone
from decimal import Decimal
from pinesphere.core.exceptions import ServiceError
from .models import MenuItem, ItemPricing, ItemAvailability, Combo


def get_menu_for_branch(branch, current_time=None):
    if current_time is None:
        current_time = timezone.now()

    items = MenuItem.objects.filter(branch=branch, is_active=True, deleted_at__isnull=True)
    result = []
    for it in items:
        price = it.base_price
        # check item pricing overrides
        pricings = ItemPricing.objects.filter(menu_item=it, branch=branch, deleted_at__isnull=True)
        for p in pricings:
            # naive: if no time constraints, pick branch price
            if not p.start_time and not p.end_time:
                price = p.price
        # availability
        avail = ItemAvailability.objects.filter(menu_item=it, branch=branch, deleted_at__isnull=True).first()
        is_available = True
        if avail and not avail.is_available:
            is_available = False

        result.append({'id': it.id, 'name': it.name, 'price': price, 'available': is_available})

    # group by category naive
    return {'items': result}


def apply_happy_hour_pricing(item: MenuItem, branch, current_time=None):
    # placeholder: reduce price by 20% during happy hour windows defined in ItemPricing
    if current_time is None:
        current_time = timezone.now()
    pricings = ItemPricing.objects.filter(menu_item=item, branch=branch, deleted_at__isnull=True)
    for p in pricings:
        if p.start_time and p.end_time:
            # naive time matching
            price = p.price
            return Decimal(price)
    return item.base_price


def push_menu_to_branches(source_branch, target_branch_ids):
    items = MenuItem.objects.filter(branch=source_branch, deleted_at__isnull=True)
    applied = []
    for tb in target_branch_ids:
        for it in items:
            # naive copy: create if not exists
            MenuItem.objects.get_or_create(branch_id=tb, name=it.name, defaults={'restaurant': it.restaurant, 'base_price': it.base_price, 'is_active': it.is_active})
        applied.append(str(tb))
    return applied
