"""Helpers for Google OAuth redirect safety and error handling."""

from __future__ import annotations

from urllib.parse import urlencode, urlparse

from django.conf import settings


def allowed_oauth_origins():
    """Return normalized origin strings allowed for OAuth redirects."""

    origins = {settings.FRONTEND_URL.rstrip("/")}
    for origin in settings.CORS_ALLOWED_ORIGINS:
        origins.add(str(origin).rstrip("/"))
    callback = settings.FRONTEND_OAUTH_CALLBACK_URL
    if callback:
        parsed = urlparse(callback)
        if parsed.scheme and parsed.netloc:
            origins.add(f"{parsed.scheme}://{parsed.netloc}".rstrip("/"))
    return origins


def validate_oauth_next_url(url: str | None) -> str:
    """Return url if its origin is allowlisted, else the default OAuth callback."""

    fallback = settings.FRONTEND_OAUTH_CALLBACK_URL
    if not url:
        return fallback

    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return fallback

    origin = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
    if origin not in allowed_oauth_origins():
        return fallback
    return url


def build_oauth_redirect(base_url: str, params: dict[str, str]) -> str:
    """Build a redirect URL with query parameters."""

    separator = "&" if "?" in base_url else "?"
    return f"{base_url}{separator}{urlencode(params)}"
