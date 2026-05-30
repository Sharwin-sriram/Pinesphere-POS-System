"""Custom JWT token helpers."""

from __future__ import annotations

from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import ROLE_PERMISSIONS


class CustomRefreshToken(RefreshToken):
    """Refresh token that embeds user profile and permission claims."""

    @classmethod
    def for_user(cls, user, device_id=None, restaurant_id=None):
        token = super().for_user(user)
        token["user_id"] = user.id
        token["email"] = user.email
        token["mobile"] = user.mobile
        token["role"] = user.role
        token["restaurant_id"] = restaurant_id if restaurant_id is not None else user.restaurant_id
        token["branch_id"] = user.branch_id
        token["permissions"] = list(ROLE_PERMISSIONS.get(user.role, []))
        token["device_id"] = device_id or ""
        return token
