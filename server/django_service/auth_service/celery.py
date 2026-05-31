"""Celery configuration for the auth_service project."""

import os
from celery import Celery

# Set default Django settings module for celery command-line program
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")

app = Celery("auth_service")

# Read config from django settings using CELERY_ namespace
app.config_from_object("django.conf:settings", namespace="CELERY")

# Discover tasks in task.py/tasks.py of installed apps
app.autodiscover_tasks()
