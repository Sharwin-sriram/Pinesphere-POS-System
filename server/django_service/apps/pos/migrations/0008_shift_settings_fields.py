# Generated manually for settings shift management fields.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("pos", "0007_role_settings_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="shift",
            name="days_of_week",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="shift",
            name="role_ids",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="shift",
            name="min_staff",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="shift",
            name="staff_assignments",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="shift",
            name="overtime_threshold_hours",
            field=models.PositiveIntegerField(default=40),
        ),
        migrations.AddField(
            model_name="shift",
            name="allow_swaps",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="shift",
            name="sort_order",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
