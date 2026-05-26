"""API views for authentication workflows."""

from __future__ import annotations

from django.conf import settings
from django.core import signing
from django.http import HttpResponseRedirect
from urllib.parse import urlencode
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_service.exceptions import OAuthError

from .serializers import (
    EmailLoginSerializer,
    LogoutSerializer,
    MobileLoginSerializer,
    OtpSendSerializer,
    OtpVerifySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    TokenRefreshSerializer,
    UserSerializer,
)
from .services.auth_service import AuthService


class GoogleOAuthStartView(APIView):
    """Redirect the user to Google OAuth consent."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        next_url = request.query_params.get("next") or settings.FRONTEND_OAUTH_CALLBACK_URL
        state = signing.dumps({"next": next_url}, salt="google-oauth-state")
        return HttpResponseRedirect(AuthService.build_google_oauth_url(state))


class GoogleOAuthCallbackView(APIView):
    """Handle Google callback, issue JWTs, and redirect to the client."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get("code")
        state = request.query_params.get("state")

        if not code or not state:
            raise OAuthError("Missing Google OAuth callback data")

        try:
            state_data = signing.loads(state, salt="google-oauth-state", max_age=600)
        except signing.BadSignature as exc:
            raise OAuthError("Invalid Google OAuth state") from exc

        profile = AuthService.exchange_google_code(code)
        user = AuthService.get_or_create_google_user(profile)
        access_token, refresh_token = AuthService.issue_tokens(user)

        redirect_url = state_data.get("next") or settings.FRONTEND_OAUTH_CALLBACK_URL
        query = urlencode(
            {
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        )
        return HttpResponseRedirect(f"{redirect_url}?{query}")


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

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"user": UserSerializer(request.user).data})


class MeUpdateView(APIView):
    """Update editable fields on the authenticated user profile."""

    permission_classes = [permissions.IsAuthenticated]

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
