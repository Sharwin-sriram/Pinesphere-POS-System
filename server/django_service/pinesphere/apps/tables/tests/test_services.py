import pytest

from pinesphere.apps.tables import services


def test_update_table_status_exists():
    assert hasattr(services, 'update_table_status')


def test_merge_tables_exists():
    assert hasattr(services, 'merge_tables')


def test_split_table_exists():
    assert hasattr(services, 'split_table')


def test_get_live_floor_exists():
    assert hasattr(services, 'get_live_floor')
