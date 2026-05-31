"""Business logic for authentication endpoints."""

from __future__ import annotations

import json
import logging
import uuid
import time
from uuid import UUID
from urllib.parse import parse_qsl, urlencode, urlsplit
from urllib.request import Request, urlopen

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from auth_service.exceptions import InvalidCredentials, InvalidOTP, OAuthError, OTPExpired, TokenExpired, UserNotFound

from ..models import Restaurant, UserSession
from ..permissions import ROLE_PERMISSIONS
from ..tokens import CustomRefreshToken
from ..utils import send_otp as send_login_otp, verify_otp as verify_login_otp
from .otp_service import delete_otp, fetch_otp, generate_otp, store_otp, get_redis_client


User = get_user_model()
logger = logging.getLogger(__name__)


class AuthService:
    """Domain service for user registration, login, sessions, and password flows."""

    FAILED_LOGIN_PREFIX = "auth_failures"
    FAILED_LOGIN_WINDOW_SECONDS = 15 * 60
    DEFAULT_MAX_FAILURES = 5

    @staticmethod
    def clean_restaurant_id(value):
        """Return a UUID restaurant id string, or None for stale/invalid values."""

        if value in (None, "", "null", "undefined"):
            return None

        restaurant_id = str(value).strip()
        if not restaurant_id or restaurant_id.lower() in {"null", "undefined"}:
            return None

        try:
            return str(UUID(restaurant_id))
        except (TypeError, ValueError, AttributeError):
            return None

    @staticmethod
    def resolve_restaurant_for_user(user):
        """Return the restaurant linked to a user, falling back to owner email matching."""

        if not user:
            return None

        restaurant_id = AuthService.clean_restaurant_id(user.restaurant_id)
        if restaurant_id:
            try:
                return Restaurant.objects.get(id=restaurant_id)
            except (Restaurant.DoesNotExist, ValidationError, ValueError, TypeError):
                pass

        if user.role == User.RoleChoices.ORGANIZATION_OWNER and user.email:
            return Restaurant.objects.filter(email__iexact=user.email).first()

        return None

    @staticmethod
    def permissions_for_role(role):
        """Return a copy of the permissions assigned to a role."""

        return list(ROLE_PERMISSIONS.get(role, []))

    @staticmethod
    def user_payload(user):
        """Serialize a user into the API response shape."""

        restaurant = AuthService.resolve_restaurant_for_user(user)
        restaurant_id = str(restaurant.id) if restaurant is not None else user.restaurant_id
        profile_image = user.profile_image.url if user.profile_image else None
        return {
            "id": user.id,
            "email": user.email,
            "mobile": user.mobile,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "restaurant_id": restaurant_id,
            "restaurant": None
            if restaurant is None
            else {
                "id": str(restaurant.id),
                "name": restaurant.name,
                "address": restaurant.address,
                "phone": restaurant.phone,
                "email": restaurant.email,
                "timezone": restaurant.timezone,
                "is_active": restaurant.is_active,
                "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None,
                "updated_at": restaurant.updated_at.isoformat() if restaurant.updated_at else None,
            },
            "branch_id": user.branch_id,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "profile_image": profile_image,
            "picture": getattr(user, "google_picture_url", None) or None,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "permissions": AuthService.permissions_for_role(user.role),
        }

    @staticmethod
    def issue_tokens(user, device_id=None):
        """Create a refresh/access token pair with the custom claim set."""

        restaurant = AuthService.resolve_restaurant_for_user(user)
        restaurant_id = str(restaurant.id) if restaurant is not None else user.restaurant_id
        refresh_token = CustomRefreshToken.for_user(
            user,
            device_id=device_id,
            restaurant_id=restaurant_id,
        )
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
    def register_device(user, device_fingerprint, device_type, ip_address):
        """
        Register (or refresh) a user device session.

        This maps to the existing `UserSession` table using `device_id` as the device fingerprint.
        """

        if not device_fingerprint:
            raise ValueError("device_fingerprint is required")
        return AuthService.create_session(
            user=user,
            device_id=device_fingerprint,
            device_type=device_type,
            ip_address=ip_address,
        )

    @staticmethod
    def _failure_key(user_id: int) -> str:
        return f"{AuthService.FAILED_LOGIN_PREFIX}:{user_id}"

    @staticmethod
    def _now_bucket() -> int:
        return int(time.time())

    @staticmethod
    def lock_account_after_failures(user, max: int = DEFAULT_MAX_FAILURES):
        """
        Enforce account lockout after repeated failures.

        Implementation: rolling counter in Redis with TTL (no schema changes).
        Raises InvalidCredentials when locked.
        """

        if user is None:
            # Can't lock a non-existent user account; handled by InvalidCredentials.
            return

        try:
            client = get_redis_client()
            key = AuthService._failure_key(user.id)
            failures = client.incr(key)
            if failures == 1:
                client.expire(key, AuthService.FAILED_LOGIN_WINDOW_SECONDS)
            if failures >= max:
                raise InvalidCredentials()
        except InvalidCredentials:
            raise
        except Exception:
            pass  # Ignore Redis errors

    @staticmethod
    def _clear_failures(user):
        if user is None:
            return
        try:
            client = get_redis_client()
            client.delete(AuthService._failure_key(user.id))
        except Exception:
            pass

    @staticmethod
    @transaction.atomic
    def register_user(data):
        """Create a user account and return the persisted instance."""

        # mobile is optional for email-only registration — generate a unique placeholder
        mobile = data.get("mobile") or ""
        if not mobile:
            import uuid
            mobile = f"e-{uuid.uuid4().hex[:18]}"

        user = User.objects.create_user(
            mobile=mobile,
            password=data["password"],
            email=data.get("email"),
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role=data.get("role", User.RoleChoices.CUSTOMER),
            restaurant_id=data.get("restaurant_id"),
            branch_id=data.get("branch_id"),
            is_active=True,
            is_staff=False,
        )
        return user

    @staticmethod
    @transaction.atomic
    def register_restaurant_owner(data):
        """Create a restaurant record and its owner account."""

        full_name = data["full_name"].strip()
        name_parts = full_name.split(None, 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        phone = data["phone"].strip()

        restaurant = Restaurant.objects.create(
            name=data["restaurant_name"].strip(),
            address=data["city"].strip(),
            phone=phone,
            email=data["email"].strip(),
            timezone="UTC",
            is_active=True,
        )

        user = User.objects.create_user(
            mobile=phone,
            password=data["password"],
            email=data["email"].strip(),
            first_name=first_name,
            last_name=last_name,
            role=User.RoleChoices.ORGANIZATION_OWNER,
            restaurant_id=None,
            branch_id=None,
            is_active=True,
            is_staff=False,
        )

        return user, restaurant

    @staticmethod
    @transaction.atomic
    def get_or_create_google_user(profile):
        """Create or update a user account from a Google profile."""

        email = profile.get("email")
        if not email:
            raise OAuthError("Google account email is required")

        first_name = profile.get("given_name") or profile.get("name", "").split(" ")[0] or ""
        last_name = profile.get("family_name") or " ".join(profile.get("name", "").split(" ")[1:]) or ""
        mobile_seed = profile.get("sub") or email.replace("@", "").replace(".", "")
        mobile = f"g-{str(mobile_seed)[:18]}"

        google_picture = profile.get("picture") or ""

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                mobile=mobile,
                password=None,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=User.RoleChoices.CUSTOMER,
                restaurant_id=None,
                branch_id=None,
                is_active=True,
                is_staff=False,
                google_picture_url=google_picture,
            )
        else:
            update_fields = []
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                update_fields.append("first_name")
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                update_fields.append("last_name")
            if google_picture and user.google_picture_url != google_picture:
                user.google_picture_url = google_picture
                update_fields.append("google_picture_url")
            if update_fields:
                update_fields.append("updated_at")
                user.save(update_fields=update_fields)

        return user

    @staticmethod
    def build_google_oauth_url(state):
        """Build the Google authorization redirect URL."""

        if not settings.GOOGLE_OAUTH_CLIENT_ID or not settings.GOOGLE_OAUTH_REDIRECT_URI:
            raise OAuthError("Google OAuth is not configured")

        params = {
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "select_account",
        }
        return f"{settings.GOOGLE_OAUTH_AUTH_URL}?{urlencode(params)}"

    @staticmethod
    def exchange_google_code(code):
        """Exchange an OAuth code for a Google profile payload."""

        if not settings.GOOGLE_OAUTH_CLIENT_ID or not settings.GOOGLE_OAUTH_CLIENT_SECRET:
            raise OAuthError("Google OAuth is not configured")

        token_payload = urlencode(
            {
                "code": code,
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        ).encode("utf-8")

        token_request = Request(
            settings.GOOGLE_OAUTH_TOKEN_URL,
            data=token_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        try:
            with urlopen(token_request, timeout=10) as response:
                token_data = json.loads(response.read().decode("utf-8"))
        except Exception as exc:  # pragma: no cover - network/provider failures.
            raise OAuthError("Failed to exchange Google code") from exc

        access_token = token_data.get("access_token")
        if not access_token:
            raise OAuthError("Google access token was not returned")

        profile_request = Request(
            settings.GOOGLE_OAUTH_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        try:
            with urlopen(profile_request, timeout=10) as response:
                profile_data = json.loads(response.read().decode("utf-8"))
        except Exception as exc:  # pragma: no cover - network/provider failures.
            raise OAuthError("Failed to fetch Google profile") from exc

        return profile_data

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
        """Validate credentials for an existing user.

        Raises:
            InvalidCredentials: If credentials are wrong, user is inactive,
                or the account is temporarily locked after too many failures.
        """

        if user is None:
            raise InvalidCredentials()

        # Check account lockout BEFORE touching the password — avoids unnecessary hashing.
        try:
            client = get_redis_client()
            key = AuthService._failure_key(user.id)
            current_failures = client.get(key)
            if current_failures is not None and int(current_failures) >= AuthService.DEFAULT_MAX_FAILURES:
                import logging
                logging.getLogger(__name__).warning(
                    "Login blocked: account %s is locked after %s failures.",
                    user.id,
                    current_failures,
                )
                raise InvalidCredentials(
                    "Account temporarily locked due to too many failed login attempts. "
                    "Please wait 15 minutes or contact support."
                )
        except InvalidCredentials:
            raise
        except Exception:
            # Redis unavailable — degrade gracefully, do not block login.
            pass

        if not user.is_active:
            raise InvalidCredentials("This account is inactive.")

        if not user.check_password(password):
            AuthService.lock_account_after_failures(user, max=AuthService.DEFAULT_MAX_FAILURES)
            raise InvalidCredentials()

        AuthService._clear_failures(user)
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

        return send_login_otp(mobile)

    @staticmethod
    @transaction.atomic
    def verify_otp(mobile, otp, device_id, device_type, ip_address):
        """Verify a mobile OTP and authenticate or create the user."""

        verification_result = verify_login_otp(mobile, otp)
        if verification_result == "expired":
            raise OTPExpired()
        if verification_result == "wrong":
            raise InvalidOTP()

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
    @transaction.atomic
    def delete_account(user, refresh_token):
        """Deactivate a user account, clear profile data, and blacklist the refresh token."""

        try:
            token = CustomRefreshToken(refresh_token)
        except Exception as exc:
            raise TokenExpired() from exc

        UserSession.objects.filter(user=user, is_active=True).update(is_active=False)
        token.blacklist()

        if user.profile_image:
            user.profile_image.delete(save=False)

        suffix = uuid.uuid4().hex[:8]
        user.email = f"deleted-{user.id}-{suffix}@invalid.local"
        user.mobile = f"del-{user.id}-{suffix}"
        user.first_name = ""
        user.last_name = ""
        user.restaurant_id = None
        user.branch_id = None
        user.google_picture_url = ""
        user.is_active = False
        user.set_unusable_password()
        user.save(
            update_fields=[
                "email",
                "mobile",
                "first_name",
                "last_name",
                "restaurant_id",
                "branch_id",
                "google_picture_url",
                "password",
                "is_active",
                "updated_at",
            ]
        )

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

        update_fields = []

        for field in ("first_name", "last_name", "email", "mobile"):
            if field in data:
                setattr(user, field, data[field])
                update_fields.append(field)

        if data.get("remove_profile_image") and user.profile_image:
            user.profile_image.delete(save=False)
            user.profile_image = None
            update_fields.append("profile_image")

        if data.get("profile_image"):
            if user.profile_image:
                user.profile_image.delete(save=False)
            user.profile_image = data["profile_image"]
            update_fields.append("profile_image")

        if not update_fields:
            return user

        update_fields.append("updated_at")
        user.save(update_fields=update_fields)
        return user
