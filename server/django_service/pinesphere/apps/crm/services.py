from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from pinesphere.core.exceptions import ServiceError
from .models import Customer, LoyaltyTransaction
from pinesphere.apps.billing.models import Order


def earn_loyalty_points(customer: Customer, order: Order, points: int):
    with transaction.atomic():
        customer.loyalty_points = customer.loyalty_points + int(points)
        customer.save()
        lt = LoyaltyTransaction.objects.create(customer=customer, order=order, points=points, type='EARN', balance_after=customer.loyalty_points)
        return lt


def redeem_points(customer: Customer, points_to_redeem: int):
    if customer.loyalty_points < points_to_redeem:
        raise ServiceError('insufficient_points', 'Customer does not have enough points')
    with transaction.atomic():
        customer.loyalty_points = customer.loyalty_points - int(points_to_redeem)
        customer.save()
        lt = LoyaltyTransaction.objects.create(customer=customer, points=points_to_redeem, type='REDEEM', balance_after=customer.loyalty_points)
        # naive conversion: 1 point = 1 currency unit
        discount_amount = Decimal(points_to_redeem)
        return {'transaction': lt, 'discount_amount': discount_amount}


def trigger_birthday_campaign(customer: Customer):
    # placeholder: would enqueue Celery task to send messages
    # For now, just return True
    return True


def get_customer_analytics(customer_id):
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        raise ServiceError('customer_not_found', 'Customer not found', status_code=404)
    visits = Order.objects.filter(customer=customer, deleted_at__isnull=True).count()
    total_spent = Order.objects.filter(customer=customer, deleted_at__isnull=True).aggregate(total=Sum('net_total'))['total'] or Decimal('0.00')
    avg_order_value = (total_spent / visits) if visits else Decimal('0.00')
    return {'visits': visits, 'avg_order_value': avg_order_value, 'points_balance': customer.loyalty_points}
