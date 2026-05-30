"""Input and output serializers for the authentication service."""

from __future__ import annotations

from uuid import UUID

from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers

from .models import Restaurant, User, UserSession
from .permissions import ROLE_PERMISSIONS


class UserSerializer(serializers.ModelSerializer):
    """Compact user response serializer."""

    permissions = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    picture = serializers.SerializerMethodField()
    restaurant_id = serializers.SerializerMethodField()
    restaurant = serializers.SerializerMethodField()

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
            "restaurant",
            "branch_id",
            "is_active",
            "is_staff",
            "profile_image",
            "picture",
            "created_at",
            "updated_at",
            "permissions",
        ]
        read_only_fields = fields

    def get_permissions(self, obj):
        return list(ROLE_PERMISSIONS.get(obj.role, []))

    def _clean_restaurant_id(self, value):
        if value in (None, "", "null", "undefined"):
            return None

        restaurant_id = str(value).strip()
        if not restaurant_id or restaurant_id.lower() in {"null", "undefined"}:
            return None

        try:
            return str(UUID(restaurant_id))
        except (TypeError, ValueError, AttributeError):
            return None

    def get_restaurant_id(self, obj):
        restaurant_id = self._clean_restaurant_id(obj.restaurant_id)
        if restaurant_id:
            return restaurant_id

        if obj.role == User.RoleChoices.ORGANIZATION_OWNER and obj.email:
            restaurant = Restaurant.objects.filter(email__iexact=obj.email).only("id").first()
            if restaurant is not None:
                return str(restaurant.id)

        return None

    def get_profile_image(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return None

    def get_picture(self, obj):
        return obj.google_picture_url or None

    def get_restaurant(self, obj):
        restaurant_id = self.get_restaurant_id(obj)
        if not restaurant_id:
            return None

        restaurant = Restaurant.objects.filter(id=restaurant_id).first()
        if restaurant is None:
            return None

        return {
            "id": str(restaurant.id),
            "name": restaurant.name,
            "address": restaurant.address,
            "phone": restaurant.phone,
            "email": restaurant.email,
            "timezone": restaurant.timezone,
            "is_active": restaurant.is_active,
            "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None,
            "updated_at": restaurant.updated_at.isoformat() if restaurant.updated_at else None,
        }


class RegisterSerializer(serializers.Serializer):
    """Validate user registration requests."""

    email = serializers.EmailField(required=True)
    mobile = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(choices=User.RoleChoices.choices, required=False, default=User.RoleChoices.CUSTOMER)
    restaurant_id = serializers.CharField(required=False, allow_null=True)
    branch_id = serializers.CharField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_mobile(self, value):
        if value and User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile already exists")
        return value

    def validate_password(self, value):
        return value


class RestaurantRegisterSerializer(serializers.Serializer):
    """Validate restaurant owner registration requests."""

    full_name = serializers.CharField(max_length=160)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    restaurant_name = serializers.CharField(max_length=255)
    cuisine_types = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    city = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=20)
    fssai_license = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone(self, value):
        phone = value.strip()
        if User.objects.filter(mobile=phone).exists():
            raise serializers.ValidationError("Phone already exists")
        return phone

    def validate_restaurant_name(self, value):
        restaurant_name = value.strip()
        if Restaurant.objects.filter(name__iexact=restaurant_name).exists():
            raise serializers.ValidationError("Restaurant already exists")
        return restaurant_name

    def validate_password(self, value):
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
        return value


class ProfileUpdateSerializer(serializers.Serializer):
    """Validate profile update payloads."""

    MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024

    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    mobile = serializers.CharField(max_length=20, required=False)
    profile_image = serializers.ImageField(required=False)
    remove_profile_image = serializers.BooleanField(required=False, default=False)

    def validate_email(self, value):
        user = self.context["request"].user
        if value and User.objects.filter(Q(email__iexact=value)).exclude(id=user.id).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_mobile(self, value):
        user = self.context["request"].user
        if value and User.objects.filter(mobile=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Mobile already exists")
        return value

    def validate_profile_image(self, value):
        if value and value.size > self.MAX_PROFILE_IMAGE_BYTES:
            raise serializers.ValidationError("Profile image must be 2MB or smaller")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        has_file = bool(request.FILES.get("profile_image"))
        if not attrs and not has_file:
            raise serializers.ValidationError({"detail": "Provide at least one field to update"})
        if attrs.get("remove_profile_image") and has_file:
            raise serializers.ValidationError({"profile_image": "Cannot upload and remove profile image at the same time"})
        return attrs
