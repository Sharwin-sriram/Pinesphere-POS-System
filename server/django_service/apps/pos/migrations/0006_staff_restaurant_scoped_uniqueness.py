# Generated migration to scope staff identity fields to a restaurant.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0005_rename_pos_cart_user_idx_pos_cart_user_id_7ab2e7_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='staffmember',
            name='email',
            field=models.EmailField(db_index=True, max_length=254),
        ),
        migrations.AlterField(
            model_name='staffmember',
            name='pin',
            field=models.CharField(blank=True, max_length=4, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='staffmember',
            unique_together={('restaurant_id', 'email'), ('restaurant_id', 'pin')},
        ),
    ]