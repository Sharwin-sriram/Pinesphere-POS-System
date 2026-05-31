"""API views for authentication workflows."""

from __future__ import annotations

import secrets

from django.conf import settings
from django.core import signing
from django.http import HttpResponseRedirect
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_service.exceptions import OAuthError

from .models import UserSession
from .oauth_utils import build_oauth_redirect, validate_oauth_next_url
from .serializers import (
    EmailLoginSerializer,
    LogoutSerializer,
    MobileLoginSerializer,
    OtpSendSerializer,
    OtpVerifySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RestaurantRegisterSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    TokenRefreshSerializer,
    UserSerializer,
)
from .services.auth_service import AuthService


def _oauth_device_id():
    return f"oauth-{secrets.token_urlsafe(16)}"


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or "127.0.0.1"


def _redirect_oauth_error(next_url: str | None, message: str) -> HttpResponseRedirect:
    target = validate_oauth_next_url(next_url)
    return HttpResponseRedirect(build_oauth_redirect(target, {"error": message}))


class GoogleOAuthStartView(APIView):
    """Redirect the user to Google OAuth consent."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        next_url = validate_oauth_next_url(
            request.query_params.get("next") or settings.FRONTEND_OAUTH_CALLBACK_URL
        )
        state = signing.dumps({"next": next_url}, salt="google-oauth-state")
        try:
            return HttpResponseRedirect(AuthService.build_google_oauth_url(state))
        except OAuthError as exc:
            return _redirect_oauth_error(next_url, str(exc.detail))


class GoogleOAuthCallbackView(APIView):
    """Handle Google callback, issue JWTs, and redirect to the client."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        google_error = request.query_params.get("error")
        if google_error:
            return _redirect_oauth_error(
                settings.FRONTEND_OAUTH_CALLBACK_URL,
                request.query_params.get("error_description") or google_error,
            )

        code = request.query_params.get("code")
        state = request.query_params.get("state")
        fallback_next = settings.FRONTEND_OAUTH_CALLBACK_URL

        if not code or not state:
            return _redirect_oauth_error(fallback_next, "Missing Google OAuth callback data")

        try:
            state_data = signing.loads(state, salt="google-oauth-state", max_age=600)
        except signing.BadSignature:
            return _redirect_oauth_error(fallback_next, "Invalid Google OAuth state")

        redirect_url = validate_oauth_next_url(state_data.get("next") or fallback_next)

        try:
            profile = AuthService.exchange_google_code(code)
            user = AuthService.get_or_create_google_user(profile)
            device_id = _oauth_device_id()
            AuthService.create_session(
                user,
                device_id,
                UserSession.DeviceType.WEB,
                _client_ip(request),
            )
            access_token, refresh_token = AuthService.issue_tokens(user, device_id=device_id)
        except OAuthError as exc:
            return _redirect_oauth_error(redirect_url, str(exc.detail))

        return HttpResponseRedirect(
            build_oauth_redirect(
                redirect_url,
                {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                },
            )
        )


class CheckEmailView(APIView):
    """Check whether an email address is available for registration."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .models import User
        email = request.query_params.get("email", "").strip()
        if not email:
            return Response({"is_available": False, "message": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        is_taken = User.objects.filter(email__iexact=email).exists()
        return Response({"is_available": not is_taken})


class RegisterView(APIView):
    """Register a new user and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = AuthService.register_user(serializer.validated_data)
        access_token, refresh_token = AuthService.issue_tokens(user)
        return Response(
            {"user": UserSerializer(user).data, "access_token": access_token, "refresh_token": refresh_token},
            status=status.HTTP_201_CREATED,
        )


class RestaurantRegisterView(APIView):
    """Register a restaurant owner and create the restaurant record."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RestaurantRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, restaurant = AuthService.register_restaurant_owner(serializer.validated_data)
        access_token, refresh_token = AuthService.issue_tokens(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "restaurant": {
                    "id": str(restaurant.id),
                    "name": restaurant.name,
                    "address": restaurant.address,
                    "phone": restaurant.phone,
                    "email": restaurant.email,
                    "timezone": restaurant.timezone,
                    "cuisine_types": serializer.validated_data.get("cuisine_types", []),
                    "fssai_license": serializer.validated_data.get("fssai_license", ""),
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailLoginView(APIView):
    """Authenticate a user with email and password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, access_token, refresh_token = AuthService.login_with_email(**serializer.validated_data)
        return Response({"access_token": access_token, "refresh_token": refresh_token, "user": UserSerializer(user).data})


class MobileLoginView(APIView):
    """Authenticate a user with mobile number and password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = MobileLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, access_token, refresh_token = AuthService.login_with_mobile(**serializer.validated_data)
        return Response({"access_token": access_token, "refresh_token": refresh_token, "user": UserSerializer(user).data})


class OtpSendView(APIView):
    """Generate and store a login OTP for a mobile number."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OtpSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.send_otp(serializer.validated_data["mobile"])
        return Response({"message": "OTP sent successfully"})


class OtpVerifyView(APIView):
    """Verify a login OTP and issue JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, access_token, refresh_token = AuthService.verify_otp(**serializer.validated_data)
        return Response({"access_token": access_token, "refresh_token": refresh_token, "user": UserSerializer(user).data})


class TokenRefreshView(APIView):
    """Exchange a refresh token for a new access token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access_token = AuthService.refresh_access_token(serializer.validated_data["refresh_token"])
        return Response({"access_token": access_token})


class LogoutView(APIView):
    """Deactivate the current device session and blacklist the refresh token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.logout(request.user, serializer.validated_data["refresh_token"])
        return Response({"message": "Logged out successfully"})


class MeView(APIView):
    """Return the currently authenticated user profile."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = getattr(request, "jwt_user", None)
        if user is None and request.user.is_authenticated:
            user = request.user
        if user is None:
            from rest_framework.exceptions import NotAuthenticated

            raise NotAuthenticated()
        return Response({"user": UserSerializer(user).data})

    def delete(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = getattr(request, "jwt_user", None) or request.user
        if user is None or not getattr(user, "is_authenticated", False):
            from rest_framework.exceptions import NotAuthenticated

            raise NotAuthenticated()

        AuthService.delete_account(user, serializer.validated_data["refresh_token"])
        return Response({"message": "Account deleted successfully"})


class MeUpdateView(APIView):
    """Update editable fields on the authenticated user profile."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = AuthService.update_profile(request.user, serializer.validated_data)
        return Response({"user": UserSerializer(user).data})


class PasswordResetRequestView(APIView):
    """Generate a password reset OTP for a user identifier."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data.get("email") or serializer.validated_data.get("mobile")
        AuthService.request_password_reset(identifier)
        return Response({"message": "Password reset OTP sent successfully"})


class PasswordResetConfirmView(APIView):
    """Confirm a password reset using the OTP from Redis."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.confirm_password_reset(**serializer.validated_data)
        return Response({"message": "Password updated successfully"})
