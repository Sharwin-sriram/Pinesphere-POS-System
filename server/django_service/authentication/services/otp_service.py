"""Redis-backed OTP storage helpers."""

from __future__ import annotations

import random
from functools import lru_cache

from django.conf import settings

try:
    import redis
except ImportError:  # pragma: no cover - dependency is provided at runtime.
    redis = None


OTP_EXPIRY_SECONDS = 300


@lru_cache(maxsize=1)
def get_redis_client():
    """Build and cache a Redis client from settings."""

    if redis is None:
        raise RuntimeError("redis package is not installed")
    return redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def generate_otp():
    """Generate a six-digit OTP string."""

    return f"{random.randint(0, 999999):06d}"


def store_otp(mobile, otp, prefix="otp", expiry=OTP_EXPIRY_SECONDS):
    """Persist an OTP in Redis under the requested key prefix."""

    key = f"{prefix}:{mobile}"
    get_redis_client().setex(key, expiry, otp)
    return key


def fetch_otp(mobile, prefix="otp"):
    """Retrieve a stored OTP value."""

    return get_redis_client().get(f"{prefix}:{mobile}")


def delete_otp(mobile, prefix="otp"):
    """Delete an OTP entry from Redis."""

    get_redis_client().delete(f"{prefix}:{mobile}")
