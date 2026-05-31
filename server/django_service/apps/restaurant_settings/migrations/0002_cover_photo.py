from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("restaurant_settings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="restaurantsettings",
            name="cover_photo",
            field=models.ImageField(blank=True, null=True, upload_to="settings/cover-photos/"),
        ),
    ]