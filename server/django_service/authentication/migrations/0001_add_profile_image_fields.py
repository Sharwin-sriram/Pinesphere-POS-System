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
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Restaurant",
            fields=[
                ("id", models.UUIDField(primary_key=True, serialize=False, default=authentication.models.uuid.uuid4, editable=False)),
                ("name", models.CharField(max_length=255, unique=True)),
                ("address", models.TextField()),
                ("phone", models.CharField(max_length=20)),
                ("email", models.EmailField(max_length=254)),
                ("timezone", models.CharField(default="UTC", max_length=50)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("password", models.CharField(db_column="password_hash", max_length=128)),
                ("last_login", models.DateTimeField(blank=True, null=True)),
                ("email", models.EmailField(blank=True, db_index=True, max_length=254, null=True, unique=True)),
                ("mobile", models.CharField(db_index=True, max_length=20, unique=True)),
                ("first_name", models.CharField(max_length=100)),
                ("last_name", models.CharField(max_length=100)),
                ("role", models.CharField(choices=[("SUPER_ADMIN", "SUPER_ADMIN"), ("ORGANIZATION_OWNER", "ORGANIZATION_OWNER"), ("BRANCH_MANAGER", "BRANCH_MANAGER"), ("CASHIER", "CASHIER"), ("WAITER", "WAITER"), ("KITCHEN_STAFF", "KITCHEN_STAFF"), ("INVENTORY_MANAGER", "INVENTORY_MANAGER"), ("ACCOUNTANT", "ACCOUNTANT"), ("DELIVERY_STAFF", "DELIVERY_STAFF"), ("CUSTOMER", "CUSTOMER")], max_length=32, db_index=True)),
                ("restaurant_id", models.IntegerField(blank=True, null=True)),
                ("branch_id", models.IntegerField(blank=True, db_index=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("is_staff", models.BooleanField(default=False)),
                ("profile_image", models.ImageField(blank=True, null=True, upload_to=authentication.models.user_profile_image_path)),
                ("google_picture_url", models.URLField(blank=True, default="", max_length=512)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "users",
                "indexes": [
                    models.Index(fields=["email"], name="users_email_idx"),
                    models.Index(fields=["mobile"], name="users_mobile_idx"),
                    models.Index(fields=["role"], name="users_role_idx"),
                    models.Index(fields=["branch_id"], name="users_branch_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="Branch",
            fields=[
                ("id", models.UUIDField(primary_key=True, serialize=False, default=authentication.models.uuid.uuid4, editable=False)),
                ("name", models.CharField(max_length=255)),
                ("address", models.TextField()),
                ("phone", models.CharField(max_length=20)),
                ("manager_name", models.CharField(blank=True, max_length=100)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("restaurant", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="branches", to="authentication.restaurant")),
            ],
            options={
                "ordering": ["name"],
                "unique_together": {("restaurant", "name")},
            },
        ),
        migrations.CreateModel(
            name="UserSession",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("device_id", models.CharField(max_length=255)),
                ("device_type", models.CharField(choices=[("POS", "POS"), ("MOBILE", "MOBILE"), ("WEB", "WEB"), ("TABLET", "TABLET")], max_length=16)),
                ("ip_address", models.GenericIPAddressField()),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("last_active", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="sessions", to="authentication.user")),
            ],
            options={
                "db_table": "user_sessions",
                "indexes": [
                    models.Index(fields=["device_id"], name="usersess_device_idx"),
                    models.Index(fields=["is_active"], name="usersess_active_idx"),
                ],
            },
        ),
    ]
