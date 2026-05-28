def test_orders_models_importable():
    from pinesphere.apps.orders import models
    assert hasattr(models, 'Order')
    assert hasattr(models, 'OrderItem')
    assert hasattr(models, 'DeliveryDetail')
    assert hasattr(models, 'PaymentReference')
