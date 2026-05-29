import pytest

from pinesphere.apps.kitchen import services


def test_auto_generate_kot_exists():
    assert hasattr(services, 'auto_generate_kot')


def test_update_kot_status_exists():
    assert hasattr(services, 'update_kot_status')


def test_reprint_kot_exists():
    assert hasattr(services, 'reprint_kot')


def test_cancel_kot_exists():
    assert hasattr(services, 'cancel_kot')
