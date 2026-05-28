from .models import Transaction, PaymentGateway, Subscription


def create_transaction(restaurant, amount, currency='INR', order=None, gateway=None, metadata=None):
    tx = Transaction.objects.create(
        restaurant=restaurant,
        order=order,
        gateway=gateway,
        amount=amount,
        currency=currency,
        metadata=metadata or {},
    )
    # NOTE: Integration with real gateway is left to specific provider implementations.
    return tx


def mark_transaction_success(tx: Transaction, provider_reference: str = None):
    tx.status = 'SUCCESS'
    if provider_reference:
        tx.provider_reference = provider_reference
    tx.save()
    return tx


def create_subscription(restaurant, plan):
    sub = Subscription.objects.create(restaurant=restaurant, plan=plan)
    return sub


def cancel_subscription(sub: Subscription):
    sub.status = 'CANCELLED'
    sub.ended_at = None
    sub.save()
    return sub
