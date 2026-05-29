import pytest


@pytest.mark.django_db
class TestBillingServices:
    def test_create_order_stub(self):
        from apps.orders.services import create_order

        order = create_order(
            tenant=None,
            branch=None,
            order_type="table",
            table_id=None,
            items=[],
        )
        assert order.order_number

    def test_add_item_stub(self):
        from apps.orders.services import add_item, create_order

        order = create_order(None, None, "table", None, [])
        item = add_item(order, "Tea", 1, None, "", unit_price=10)
        assert item.order_id == order.id

    def test_void_item_stub(self):
        from apps.orders.services import add_item, create_order, void_item

        order = create_order(None, None, "table", None, [])
        item = add_item(order, "Tea", 1, None, "", unit_price=10)
        item = void_item(order, str(item.id), "wrong entry")
        assert item.status == "cancelled"

    def test_calculate_totals_stub(self):
        from apps.orders.services import add_item, calculate_totals, create_order

        order = create_order(None, None, "table", None, [])
        add_item(order, "Tea", 2, None, "", unit_price=10)
        totals = calculate_totals(order)
        assert "net_total" in totals

    def test_apply_discount_stub(self):
        from apps.orders.services import apply_discount, create_order

        order = create_order(None, None, "table", None, [])
        order = apply_discount(order, "amount", 10, "promo")
        assert "DISCOUNT" in (order.notes or "")

    def test_apply_coupon_stub(self):
        from apps.orders.services import BillingNotImplemented, apply_coupon, create_order

        order = create_order(None, None, "table", None, [])
        with pytest.raises(BillingNotImplemented):
            apply_coupon(order, "SAVE10")

    def test_process_payment_stub(self):
        from apps.orders.services import create_order, process_payment

        order = create_order(None, None, "table", None, [])
        result = process_payment(order, [{"mode": "cash", "amount": "50.00"}])
        assert result["status"] == "processed"

    def test_process_refund_stub(self):
        from apps.orders.services import BillingNotImplemented, process_refund

        with pytest.raises(BillingNotImplemented):
            process_refund("pay_1", 10, "customer request")

    def test_generate_gst_invoice_pdf_stub(self):
        from apps.orders.services import create_order, generate_gst_invoice_pdf

        order = create_order(None, None, "table", None, [])
        pdf_bytes = generate_gst_invoice_pdf(order)
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 0

    def test_get_order_or_404_stub(self):
        from apps.orders.services import create_order, get_order_or_404

        order = create_order(None, None, "table", None, [])
        loaded = get_order_or_404(str(order.id))
        assert loaded.id == order.id

