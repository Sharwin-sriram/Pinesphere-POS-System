from django.db import migrations


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql='''
            CREATE SCHEMA IF NOT EXISTS shared_schema;
            CREATE SCHEMA IF NOT EXISTS django_schema;
            ''',
            reverse_sql='''
            DROP SCHEMA IF EXISTS shared_schema CASCADE;
            DROP SCHEMA IF EXISTS django_schema CASCADE;
            ''',
        )
    ]
