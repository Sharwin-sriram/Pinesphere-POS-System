def test_delivery_services_exist():
    from pinesphere.apps.delivery import services
    assert hasattr(services, 'create_delivery')
    assert hasattr(services, 'assign_courier')
    assert hasattr(services, 'update_status')
    assert hasattr(services, 'log_event')
