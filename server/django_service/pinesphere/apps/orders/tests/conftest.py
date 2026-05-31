"""
Pytest configuration for orders tests.
"""
import pytest
from django.core.management import call_command


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker):
    """
    Custom database setup that ensures migrations are run in the correct order.
    """
    with django_db_blocker.unblock():
        # Run migrations for authentication app first
        call_command('migrate', 'authentication', verbosity=0)
        # Then run migrations for all other apps
        call_command('migrate', verbosity=0)
