import pytest

from pinesphere.apps.menu import services


def test_get_menu_for_branch_exists():
    assert hasattr(services, 'get_menu_for_branch')


def test_apply_happy_hour_pricing_exists():
    assert hasattr(services, 'apply_happy_hour_pricing')


def test_push_menu_to_branches_exists():
    assert hasattr(services, 'push_menu_to_branches')
