"""JWT middleware for Bearer token enforcement on protected auth routes."""

from __future__ import annotations

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class JWTAuthenticationMiddleware:
    """Validate Bearer tokens on protected auth endpoints and attach payload data."""

    public_paths = {
        "/auth/register/",
        "/auth/login/email/",
        "/auth/login/mobile/",
        "/auth/oauth/google/start/",
        "/auth/oauth/google/callback/",
        "/auth/otp/send/",
        "/auth/otp/verify/",
        "/auth/token/refresh/",
        "/auth/password/reset/request/",
        "/auth/password/reset/confirm/",
    }

    protected_prefix = "/auth/"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith(self.protected_prefix):
            return self.get_response(request)

        authorization = request.META.get("HTTP_AUTHORIZATION", "")
        if not authorization:
            if request.path in self.public_paths:
                return self.get_response(request)
            return JsonResponse({"message": "Unauthorized"}, status=401)

        try:
            scheme, token = authorization.split(" ", 1)
            if scheme.lower() != "bearer" or not token:
                raise InvalidToken("Invalid token")
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except jwt.ExpiredSignatureError:
            return JsonResponse({"message": "Token expired"}, status=401)
        except (ValueError, jwt.InvalidTokenError, TokenError, InvalidToken):
            return JsonResponse({"message": "Invalid token"}, status=401)

        User = get_user_model()
        user_id = payload.get("user_id")
        user = User.objects.filter(id=user_id).only(
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
        ).first()
        if user is None:
            return JsonResponse({"message": "User not found"}, status=404)
        if not user.is_active:
            return JsonResponse({"message": "Forbidden"}, status=403)

        request.jwt_payload = payload
        request.jwt_user = user
        return self.get_response(request)