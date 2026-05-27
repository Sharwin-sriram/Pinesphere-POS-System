"""Apply profile image columns to the users table (one-time setup)."""

import os
import sys

import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")
django.setup()

from django.db import connection
from django.utils import timezone


def main():
    with connection.cursor() as cursor:
        cursor.execute(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_picture_url varchar(512) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image varchar(100) NULL"
        )
        cursor.execute(
            "SELECT 1 FROM django_migrations WHERE app = %s AND name = %s",
            ["authentication", "0001_add_profile_image_fields"],
        )
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, %s)",
                ["authentication", "0001_add_profile_image_fields", timezone.now()],
            )
    print("Profile image columns are ready.")


if __name__ == "__main__":
    main()
