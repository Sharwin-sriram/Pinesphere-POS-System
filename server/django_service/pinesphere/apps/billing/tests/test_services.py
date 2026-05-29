import pytest

from pinesphere.apps.billing import services


def test_create_order_stub():
    # TODO: implement with fixtures
    assert hasattr(services, 'create_order')


def test_add_item_stub():
    assert hasattr(services, 'add_item')


def test_void_item_stub():
    assert hasattr(services, 'void_item')


def test_calculate_totals_stub():
    assert hasattr(services, 'calculate_totals')


def test_apply_discount_stub():
    assert hasattr(services, 'apply_discount')


def test_apply_coupon_stub():
    assert hasattr(services, 'apply_coupon')


def test_process_payment_stub():
    assert hasattr(services, 'process_payment')


def test_process_refund_stub():
    assert hasattr(services, 'process_refund')


def test_generate_gst_invoice_pdf_stub():
    assert hasattr(services, 'generate_gst_invoice_pdf')
