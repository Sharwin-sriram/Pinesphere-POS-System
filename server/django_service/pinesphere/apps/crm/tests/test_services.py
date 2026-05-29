import pytest

from pinesphere.apps.crm import services


def test_earn_loyalty_points_exists():
    assert hasattr(services, 'earn_loyalty_points')


def test_redeem_points_exists():
    assert hasattr(services, 'redeem_points')


def test_trigger_birthday_campaign_exists():
    assert hasattr(services, 'trigger_birthday_campaign')


def test_get_customer_analytics_exists():
    assert hasattr(services, 'get_customer_analytics')
