"""Input and output serializers for the authentication service."""

from __future__ import annotations

from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers

from .models import User, UserSession
from .permissions import ROLE_PERMISSIONS


class UserSerializer(serializers.ModelSerializer):
    """Compact user response serializer."""

    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "mobile",
            "first_name",
            "last_name",
            "role",
            "restaurant_id",
            "branch_id",
            "is_active",
            "is_staff",
            "created_at",
            "updated_at",
            "permissions",
        ]
        read_only_fields = fields

    def get_permissions(self, obj):
        return list(ROLE_PERMISSIONS.get(obj.role, []))


class RegisterSerializer(serializers.Serializer):
    """Validate user registration requests."""

    email = serializers.EmailField(required=True)
    mobile = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    role = serializers.ChoiceField(choices=User.RoleChoices.choices, required=False, default=User.RoleChoices.CUSTOMER)
    restaurant_id = serializers.IntegerField(required=False, allow_null=True)
    branch_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_mobile(self, value):
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile already exists")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value


class EmailLoginSerializer(serializers.Serializer):
    """Validate email login input."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    device_id = serializers.CharField(max_length=255)
    device_type = serializers.ChoiceField(choices=UserSession.DeviceType.choices)
    ip_address = serializers.IPAddressField()


class MobileLoginSerializer(serializers.Serializer):
    """Validate mobile login input."""

    mobile = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)
    device_id = serializers.CharField(max_length=255)
    device_type = serializers.ChoiceField(choices=UserSession.DeviceType.choices)
    ip_address = serializers.IPAddressField()


class OtpSendSerializer(serializers.Serializer):
    """Validate OTP send requests."""

    mobile = serializers.CharField(max_length=20)


class OtpVerifySerializer(serializers.Serializer):
    """Validate OTP verification requests."""

    mobile = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)
    device_id = serializers.CharField(max_length=255)
    device_type = serializers.ChoiceField(choices=UserSession.DeviceType.choices)
    ip_address = serializers.IPAddressField()


class TokenRefreshSerializer(serializers.Serializer):
    """Validate refresh token exchange requests."""

    refresh_token = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    """Validate logout requests."""

    refresh_token = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    """Validate password reset request payloads."""

    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    mobile = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=20)

    def validate(self, attrs):
        if not attrs.get("email") and not attrs.get("mobile"):
            raise serializers.ValidationError({"detail": "Provide email or mobile"})
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Validate password reset confirmation payloads."""

    mobile = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ProfileUpdateSerializer(serializers.Serializer):
    """Validate profile update payloads."""

    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)

    def validate_email(self, value):
        user = self.context["request"].user
        if value and User.objects.filter(Q(email__iexact=value)).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError({"detail": "Provide at least one field to update"})
        return attrs
