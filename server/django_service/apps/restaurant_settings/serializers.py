from rest_framework import serializers

from authentication.models import Restaurant
from apps.pos.models import Role, MenuCategory, Shift
from apps.kitchen_display_system.models import PrinterConfiguration, KdsStation
from .models import RestaurantSettings


WEEKDAY_CHOICES = [
    (0, "Monday"),
    (1, "Tuesday"),
    (2, "Wednesday"),
    (3, "Thursday"),
    (4, "Friday"),
    (5, "Saturday"),
    (6, "Sunday"),
]


class OperatingHourSerializer(serializers.Serializer):
    day = serializers.IntegerField(min_value=0, max_value=6)
    closed = serializers.BooleanField(default=False)
    open = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    close = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class RestaurantProfileSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    address = serializers.CharField(allow_blank=True, required=False)
    phone = serializers.CharField(max_length=20, allow_blank=True, required=False)
    email = serializers.EmailField(allow_blank=True, required=False)
    tax_id = serializers.CharField(max_length=100, allow_blank=True, required=False)
    default_timezone = serializers.CharField(max_length=50, required=False)
    currency = serializers.CharField(max_length=16, required=False)
    language = serializers.CharField(max_length=16, required=False)
    locale = serializers.CharField(max_length=32, required=False)
    operating_hours = OperatingHourSerializer(many=True, required=False)
    table_count = serializers.IntegerField(min_value=0, required=False)
    floor_capacity = serializers.IntegerField(min_value=0, required=False)
    is_active = serializers.BooleanField(required=False)


class RoleSerializer(serializers.ModelSerializer):
    staff_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "color",
            "icon",
            "is_system",
            "permissions",
            "sort_order",
            "staff_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_system", "staff_count", "created_at", "updated_at"]


class PermissionEnumSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    actions = serializers.ListField(child=serializers.CharField())


class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = [
            "id",
            "name",
            "description",
            "emoji",
            "color",
            "is_active",
            "start_time",
            "end_time",
            "kds_station_id",
            "parent_id",
            "sort_order",
            "created_at",
            "updated_at",
        ]


class KdsStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KdsStation
        fields = [
            "id",
            "name",
            "label",
            "color",
            "type",
            "printer",
            "alert_seconds",
            "critical_seconds",
            "sound_enabled",
            "layout",
            "menu_category_ids",
            "is_active",
            "sort_order",
            "created_at",
            "updated_at",
        ]


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = [
            "id",
            "name",
            "start_time",
            "end_time",
            "days_of_week",
            "role_ids",
            "min_staff",
            "staff_assignments",
            "overtime_threshold_hours",
            "allow_swaps",
            "sort_order",
            "created_at",
            "updated_at",
        ]


class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrinterConfiguration
        fields = [
            "id",
            "name",
            "label",
            "printer_type",
            "connection_type",
            "printer_address",
            "port_number",
            "is_active",
            "is_default",
            "paper_width",
            "paper_size",
            "encoding",
            "auto_cut",
            "cash_drawer_enabled",
            "assigned_order_types",
            "created_at",
            "updated_at",
        ]


class PaymentRateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    percentage = serializers.FloatField(min_value=0)
    applies_to = serializers.ChoiceField(choices=["all", "dine-in", "takeout", "delivery"])
    compound = serializers.BooleanField(default=False)


class PaymentSettingsSerializer(serializers.Serializer):
    accepted_payment_methods = serializers.DictField(child=serializers.BooleanField(), required=False)
    tax_rates = PaymentRateSerializer(many=True, required=False)
    service_charge = serializers.DictField(required=False)
    tip_presets = serializers.ListField(child=serializers.CharField(), required=False)
    rounding_rule = serializers.ChoiceField(choices=["0.01", "0.05", "0.10"], required=False)
    terminal_ids = serializers.DictField(child=serializers.CharField(allow_blank=True), required=False)


class NotificationSettingsSerializer(serializers.Serializer):
    email = serializers.DictField(child=serializers.BooleanField(), required=False)
    sms = serializers.DictField(child=serializers.BooleanField(), required=False)
    sms_phone = serializers.CharField(required=False, allow_blank=True)
    role_preferences = serializers.DictField(child=serializers.BooleanField(), required=False)
    escalation_minutes = serializers.IntegerField(min_value=0, required=False)
    summary_schedule = serializers.CharField(required=False, allow_blank=True)


class SecuritySettingsSerializer(serializers.Serializer):
    session_timeout = serializers.IntegerField(min_value=5, required=False)
    pin_login_enabled = serializers.BooleanField(required=False)
    totp_enabled = serializers.BooleanField(required=False)
    ip_allowlist = serializers.ListField(child=serializers.CharField(), required=False)
    audit_log_retention_days = serializers.IntegerField(min_value=1, required=False)
    password_policy = serializers.DictField(required=False)


class IntegrationSettingsSerializer(serializers.Serializer):
    pos = serializers.DictField(required=False)
    delivery_platforms = serializers.DictField(required=False)
    accounting = serializers.DictField(required=False)
    reservation = serializers.DictField(required=False)
    loyalty = serializers.DictField(required=False)
    webhooks = serializers.DictField(required=False)


class RestaurantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantSettings
        fields = [
            "id",
            "restaurant",
            "logo",
            "cover_photo",
            "tax_id",
            "default_timezone",
            "currency",
            "language",
            "locale",
            "operating_hours",
            "table_count",
            "floor_capacity",
            "payment_settings",
            "notification_settings",
            "security_settings",
            "integration_settings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["restaurant", "created_at", "updated_at"]
