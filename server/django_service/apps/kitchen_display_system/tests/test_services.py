import pytest
from uuid import uuid4


@pytest.mark.django_db
class TestKitchenPhaseOneServices:
    def test_auto_generate_kot_stub(self):
        from apps.orders.models import Order
        from apps.kitchen_display_system.models import KitchenDisplaySystem, Kitchen
        from authentication.models import Restaurant
        from apps.kitchen_display_system.services import auto_generate_kot

        restaurant = Restaurant.objects.create(
            name=f"R-{uuid4().hex[:8]}",
            address="addr",
            phone="1111111111",
            email=f"kitchen-{uuid4().hex[:8]}@example.com",
            timezone="UTC",
            is_active=True,
        )
        kds = KitchenDisplaySystem.objects.create(restaurant=restaurant, is_active=True)
        Kitchen.objects.create(kds=kds, name="Main", kitchen_type="main", is_active=True)
        order = Order.objects.create(order_number="ORD-KOT-1", status="pending")
        kots = auto_generate_kot(order)
        assert len(kots) == 1

    def test_update_kot_status_stub(self):
        from apps.orders.models import Order
        from apps.kitchen_display_system.models import KitchenDisplaySystem, Kitchen, KitchenOrderTicket
        from authentication.models import Restaurant
        from apps.kitchen_display_system.services import update_kot_status

        restaurant = Restaurant.objects.create(
            name="R-Status",
            address="addr",
            phone="2222222222",
            email="status@example.com",
            timezone="UTC",
            is_active=True,
        )
        kds = KitchenDisplaySystem.objects.create(restaurant=restaurant, is_active=True)
        kitchen = Kitchen.objects.create(kds=kds, name="Main", kitchen_type="main", is_active=True)
        order = Order.objects.create(order_number="ORD-KOT-2", status="pending")
        kot = KitchenOrderTicket.objects.create(order=order, kitchen=kitchen, kot_number="KOT-TEST-2")
        status_obj = update_kot_status(str(kot.id), "READY", staff=None)
        assert status_obj.status == "ready"

    def test_reprint_kot_stub(self):
        from apps.orders.models import Order
        from apps.kitchen_display_system.models import KitchenDisplaySystem, Kitchen, KitchenOrderTicket
        from authentication.models import Restaurant
        from apps.kitchen_display_system.services import reprint_kot

        restaurant = Restaurant.objects.create(
            name="R-Reprint",
            address="addr",
            phone="3333333333",
            email="reprint@example.com",
            timezone="UTC",
            is_active=True,
        )
        kds = KitchenDisplaySystem.objects.create(restaurant=restaurant, is_active=True)
        kitchen = Kitchen.objects.create(kds=kds, name="Main", kitchen_type="main", is_active=True)
        order = Order.objects.create(order_number="ORD-KOT-3", status="pending")
        kot = KitchenOrderTicket.objects.create(order=order, kitchen=kitchen, kot_number="KOT-TEST-3")
        payload = reprint_kot(str(kot.id))
        assert payload["kot_id"] == str(kot.id)

