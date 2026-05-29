# Generated manually for settings role management fields.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("pos", "0006_staff_restaurant_scoped_uniqueness"),
    ]

    operations = [
        migrations.AddField(
            model_name="role",
            name="icon",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="role",
            name="is_system",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="role",
            name="permissions",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="role",
            name="sort_order",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
