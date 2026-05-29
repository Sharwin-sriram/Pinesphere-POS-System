# Generated migration for staff management models

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_id', models.CharField(db_index=True, max_length=50)),
                ('name', models.CharField(max_length=100)),
                ('color', models.CharField(default='blue', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'unique_together': {('restaurant_id', 'name')},
            },
        ),
        migrations.CreateModel(
            name='Shift',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_id', models.CharField(db_index=True, max_length=50)),
                ('name', models.CharField(max_length=100)),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='StaffMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('restaurant_id', models.CharField(db_index=True, max_length=50)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(db_index=True, max_length=254, unique=True)),
                ('phone', models.CharField(max_length=20)),
                ('dob', models.DateField(blank=True, null=True)),
                ('profile_photo', models.URLField(blank=True, default='')),
                ('role', models.CharField(max_length=100)),
                ('employment_type', models.CharField(choices=[('Full-time', 'Full-time'), ('Part-time', 'Part-time'), ('Contract', 'Contract')], default='Full-time', max_length=20)),
                ('date_joined', models.DateField()),
                ('salary_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('On Leave', 'On Leave')], default='Active', max_length=20)),
                ('assigned_shift', models.CharField(blank=True, max_length=50)),
                ('pin', models.CharField(blank=True, max_length=4, null=True, unique=True)),
                ('admin_access', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'unique_together': {('restaurant_id', 'email')},
            },
        ),
        migrations.AddIndex(
            model_name='shift',
            index=models.Index(fields=['restaurant_id'], name='pos_shift_restaurant_id_idx'),
        ),
        migrations.AddIndex(
            model_name='staffmember',
            index=models.Index(fields=['restaurant_id'], name='pos_staffmember_restaurant_id_idx'),
        ),
        migrations.AddIndex(
            model_name='staffmember',
            index=models.Index(fields=['restaurant_id', 'status'], name='pos_staffmember_restaurant_status_idx'),
        ),
        migrations.AddIndex(
            model_name='staffmember',
            index=models.Index(fields=['restaurant_id', 'role'], name='pos_staffmember_restaurant_role_idx'),
        ),
    ]
