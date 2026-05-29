import pytest

from pinesphere.apps.inventory import services


def test_deduct_stock_on_order_exists():
    assert hasattr(services, 'deduct_stock_on_order')


def test_receive_grn_exists():
    assert hasattr(services, 'receive_grn')


def test_check_low_stock_exists():
    assert hasattr(services, 'check_low_stock')


def test_transfer_stock_exists():
    assert hasattr(services, 'transfer_stock')
