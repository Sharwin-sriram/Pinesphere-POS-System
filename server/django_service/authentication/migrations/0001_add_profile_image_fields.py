"""Add profile_image and google_picture_url to users."""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS google_picture_url varchar(512) NOT NULL DEFAULT '';
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS profile_image varchar(100) NULL;
            """,
            reverse_sql="""
                ALTER TABLE users DROP COLUMN IF EXISTS profile_image;
                ALTER TABLE users DROP COLUMN IF EXISTS google_picture_url;
            """,
        ),
    ]
