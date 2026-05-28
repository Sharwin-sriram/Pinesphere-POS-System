def test_delivery_models_importable():
    from pinesphere.apps.delivery import models
    assert hasattr(models, 'Delivery')
    assert hasattr(models, 'DeliveryCourier')
    assert hasattr(models, 'DeliveryEvent')
    assert hasattr(models, 'ExternalCourierProvider')
