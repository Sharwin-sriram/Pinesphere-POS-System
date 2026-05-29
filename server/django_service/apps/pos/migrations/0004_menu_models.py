# Generated migration for persisted menu models

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pos', '0003_cart_models'),
    ]

    operations = [
        migrations.CreateModel(
            name='MenuCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_id', models.CharField(db_index=True, max_length=50)),
                ('name', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'unique_together': {('restaurant_id', 'name')},
            },
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_id', models.CharField(db_index=True, max_length=50)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('category', models.CharField(db_index=True, default='General', max_length=100, blank=True)),
                ('is_veg', models.BooleanField(default=True)),
                ('tags', models.JSONField(blank=True, default=list)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('discount_price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('quantity', models.PositiveIntegerField(default=0)),
                ('low_stock_threshold', models.PositiveIntegerField(default=5)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('Out of Stock', 'Out of Stock')], default='Active', max_length=20)),
                ('image_url', models.URLField(blank=True, null=True)),
                ('available_days', models.JSONField(blank=True, default=list)),
                ('available_hours', models.JSONField(blank=True, default=dict, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'indexes': [
                    models.Index(fields=['restaurant_id'], name='pos_menuitem_restaurant_id_idx'),
                    models.Index(fields=['restaurant_id', 'category'], name='pos_menuitem_restaurant_category_idx'),
                    models.Index(fields=['restaurant_id', 'status'], name='pos_menuitem_restaurant_status_idx'),
                    models.Index(fields=['restaurant_id', 'name'], name='pos_menuitem_restaurant_name_idx'),
                ],
            },
        ),
        migrations.AddIndex(
            model_name='menucategory',
            index=models.Index(fields=['restaurant_id'], name='pos_menucat_restaurant_id_idx'),
        ),
        migrations.AddIndex(
            model_name='menucategory',
            index=models.Index(fields=['restaurant_id', 'name'], name='pos_menucat_restaurant_name_idx'),
        ),
    ]
