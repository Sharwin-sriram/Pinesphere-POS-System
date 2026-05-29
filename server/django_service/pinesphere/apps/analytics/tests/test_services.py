import pytest

from pinesphere.apps.analytics import services


def test_get_daily_sales_exists():
    assert hasattr(services, 'get_daily_sales')


def test_get_shift_summary_exists():
    assert hasattr(services, 'get_shift_summary')


def test_get_top_items_exists():
    assert hasattr(services, 'get_top_items')
