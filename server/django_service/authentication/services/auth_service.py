"""Business logic for authentication endpoints."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone

from auth_service.exceptions import InvalidCredentials, InvalidOTP, OTPExpired, TokenExpired, UserNotFound

from ..models import UserSession
from ..permissions import ROLE_PERMISSIONS
from ..tokens import CustomRefreshToken
from .otp_service import delete_otp, fetch_otp, generate_otp, store_otp


User = get_user_model()


class AuthService:
    """Domain service for user registration, login, sessions, and password flows."""

    @staticmethod
    def permissions_for_role(role):
        """Return a copy of the permissions assigned to a role."""

        return list(ROLE_PERMISSIONS.get(role, []))

    @staticmethod
    def user_payload(user):
        """Serialize a user into the API response shape."""

        return {
            "id": user.id,
            "email": user.email,
            "mobile": user.mobile,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "restaurant_id": user.restaurant_id,
            "branch_id": user.branch_id,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "permissions": AuthService.permissions_for_role(user.role),
        }

    @staticmethod
    def issue_tokens(user, device_id=None):
        """Create a refresh/access token pair with the custom claim set."""

        refresh_token = CustomRefreshToken.for_user(user, device_id=device_id)
        return str(refresh_token.access_token), str(refresh_token)

    @staticmethod
    def create_session(user, device_id, device_type, ip_address):
        """Create or refresh a login session for the given device."""

        session, _ = UserSession.objects.update_or_create(
            user=user,
            device_id=device_id,
            defaults={
                "device_type": device_type,
                "ip_address": ip_address,
                "is_active": True,
                "last_active": timezone.now(),
            },
        )
        return session

    @staticmethod
    @transaction.atomic
    def register_user(data):
        """Create a user account and return the persisted instance."""

        user = User.objects.create_user(
            mobile=data["mobile"],
            password=data["password"],
            email=data.get("email"),
            first_name=data["first_name"],
            last_name=data["last_name"],
            role=data["role"],
            restaurant_id=data.get("restaurant_id"),
            branch_id=data.get("branch_id"),
            is_active=True,
            is_staff=False,
        )
        return user

    @staticmethod
    def _get_user_by_email(email):
        """Fetch a user by email with a minimal column set."""

        return (
            User.objects.filter(email__iexact=email)
            .only("id", "email", "mobile", "password", "first_name", "last_name", "role", "restaurant_id", "branch_id", "is_active", "is_staff", "created_at", "updated_at")
            .first()
        )

    @staticmethod
    def _get_user_by_mobile(mobile):
        """Fetch a user by mobile with a minimal column set."""

        return (
            User.objects.filter(mobile=mobile)
            .only("id", "email", "mobile", "password", "first_name", "last_name", "role", "restaurant_id", "branch_id", "is_active", "is_staff", "created_at", "updated_at")
            .first()
        )

    @staticmethod
    def _authenticate_user(user, password):
        """Validate credentials for an existing user."""

        if user is None or not user.check_password(password) or not user.is_active:
            raise InvalidCredentials()
        return user

    @staticmethod
    @transaction.atomic
    def login_with_email(email, password, device_id, device_type, ip_address):
        """Authenticate using email and create a device session."""

        user = AuthService._authenticate_user(AuthService._get_user_by_email(email), password)
        AuthService.create_session(user, device_id, device_type, ip_address)
        access_token, refresh_token = AuthService.issue_tokens(user, device_id=device_id)
        return user, access_token, refresh_token

    @staticmethod
    @transaction.atomic
    def login_with_mobile(mobile, password, device_id, device_type, ip_address):
        """Authenticate using mobile and create a device session."""

        user = AuthService._authenticate_user(AuthService._get_user_by_mobile(mobile), password)
        AuthService.create_session(user, device_id, device_type, ip_address)
        access_token, refresh_token = AuthService.issue_tokens(user, device_id=device_id)
        return user, access_token, refresh_token

    @staticmethod
    def send_otp(mobile):
        """Generate and store a login OTP for a mobile number."""

        otp = generate_otp()
        store_otp(mobile, otp, prefix="otp")
        print(f"OTP for {mobile}: {otp}")
        return otp

    @staticmethod
    @transaction.atomic
    def verify_otp(mobile, otp, device_id, device_type, ip_address):
        """Verify a mobile OTP and authenticate or create the user."""

        stored_otp = fetch_otp(mobile, prefix="otp")
        if stored_otp is None:
            raise OTPExpired()
        if stored_otp != otp:
            raise InvalidOTP()

        delete_otp(mobile, prefix="otp")

        user = AuthService._get_user_by_mobile(mobile)
        if user is None:
            user = User.objects.create_user(
                mobile=mobile,
                password=None,
                email=None,
                first_name="",
                last_name="",
                role=User.RoleChoices.CUSTOMER,
                restaurant_id=None,
                branch_id=None,
                is_active=True,
                is_staff=False,
            )

        AuthService.create_session(user, device_id, device_type, ip_address)
        access_token, refresh_token = AuthService.issue_tokens(user, device_id=device_id)
        return user, access_token, refresh_token

    @staticmethod
    def refresh_access_token(refresh_token):
        """Exchange a refresh token for a new access token."""

        try:
            token = CustomRefreshToken(refresh_token)
        except Exception as exc:  # pragma: no cover - mapped by exception handler.
            raise TokenExpired() from exc
        return str(token.access_token)

    @staticmethod
    @transaction.atomic
    def logout(user, refresh_token):
        """Deactivate the current session and blacklist the refresh token."""

        try:
            token = CustomRefreshToken(refresh_token)
        except Exception as exc:
            raise TokenExpired() from exc

        device_id = token.get("device_id")
        UserSession.objects.filter(user=user, device_id=device_id, is_active=True).update(is_active=False)
        token.blacklist()

    @staticmethod
    def request_password_reset(identifier):
        """Create a reset OTP for the supplied email or mobile identifier."""

        user = None
        if "@" in identifier:
            user = AuthService._get_user_by_email(identifier)
        if user is None:
            user = AuthService._get_user_by_mobile(identifier)
        if user is None:
            raise UserNotFound()

        otp = generate_otp()
        store_otp(user.mobile, otp, prefix="reset")
        return otp, user.mobile

    @staticmethod
    @transaction.atomic
    def confirm_password_reset(mobile, otp, new_password):
        """Validate the reset OTP and persist the new password."""

        stored_otp = fetch_otp(mobile, prefix="reset")
        if stored_otp is None:
            raise OTPExpired()
        if stored_otp != otp:
            raise InvalidOTP()

        user = AuthService._get_user_by_mobile(mobile)
        if user is None:
            raise UserNotFound()

        validate_password(new_password, user=user)
        user.set_password(new_password)
        user.save(update_fields=["password", "updated_at"])
        delete_otp(mobile, prefix="reset")
        return user

    @staticmethod
    def update_profile(user, data):
        """Update editable profile fields for the authenticated user."""

        for field in ("first_name", "last_name", "email"):
            if field in data:
                setattr(user, field, data[field])
        user.save(update_fields=["first_name", "last_name", "email", "updated_at"])
        return user
