"""Project settings for the authentication service."""

import environ
import os
from datetime import timedelta
import hashlib
from pathlib import Path
from urllib.parse import urlparse

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


SECRET_KEY = config("SECRET_KEY", default="django-insecure-change-me")
DEBUG_VALUE = str(config("DEBUG", default="False")).strip().lower()
DEBUG = DEBUG_VALUE in {"1", "true", "yes", "on", "debug", "development", "dev"}
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())
USE_CLOUDINARY = config("USE_CLOUDINARY", default=False, cast=bool)
CLOUDINARY_URL = config("CLOUDINARY_URL", default="")
CLOUDINARY_CLOUD_NAME = config("CLOUDINARY_CLOUD_NAME", default="")
CLOUDINARY_API_KEY = config("CLOUDINARY_API_KEY", default="")
CLOUDINARY_API_SECRET = config("CLOUDINARY_API_SECRET", default="")

if CLOUDINARY_URL:
    parsed_cloudinary_url = urlparse(CLOUDINARY_URL)
    if parsed_cloudinary_url.scheme != "cloudinary":
        raise RuntimeError("CLOUDINARY_URL must use the cloudinary:// scheme")

    CLOUDINARY_API_KEY = CLOUDINARY_API_KEY or (parsed_cloudinary_url.username or "")
    CLOUDINARY_API_SECRET = CLOUDINARY_API_SECRET or (parsed_cloudinary_url.password or "")
    CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME or (parsed_cloudinary_url.hostname or "")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "channels",
    "authentication",
    "apps.pos",
    "apps.kitchen_display_system",
    "apps.orders",
    "apps.inventory.apps.InventoryConfig",
    "apps.restaurant_settings",
    "apps.hr",
    # Pinesphere apps (core backend)
    "pinesphere.apps.billing",
    "pinesphere.apps.tables",
    "pinesphere.apps.kitchen",
    "pinesphere.apps.analytics",
    "pinesphere.apps.inventory",
    "pinesphere.apps.menu",
    "pinesphere.apps.orders.apps.PinesphereOrdersConfig",
    "pinesphere.apps.delivery",
    "pinesphere.apps.payments",
]

if USE_CLOUDINARY and not CLOUDINARY_URL:
    raise RuntimeError("Cloudinary is enabled but CLOUDINARY_URL must be set")

if USE_CLOUDINARY and not (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET):
    raise RuntimeError(
        "Cloudinary is enabled but CLOUDINARY_URL must include the cloud name, API key, and API secret"
    )

STORAGES = {
    "default": {
        "BACKEND": (
            "auth_service.storage_backends.CloudinaryMediaStorage"
            if USE_CLOUDINARY
            else "django.core.files.storage.FileSystemStorage"
        )
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "auth_service.middleware.JWTAuthenticationMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "auth_service.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = "auth_service.asgi.application"

# Database configuration using django-environ
DB_ENGINE = env.str("DB_ENGINE", default="django.db.backends.postgresql")
if "sqlite3" in DB_ENGINE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": env.str("DB_NAME", env.str("DATABASE_NAME", "db.sqlite3")),
        }
    }
else:
    # Build database URL from separate params if not directly supplied in DATABASE_URL
    db_url = env.str(
        "DATABASE_URL",
        default=f"psql://{env.str('DB_USER', env.str('DATABASE_USER', 'postgres'))}:{env.str('DB_PASSWORD', env.str('DATABASE_PASSWORD', ''))}@{env.str('DB_HOST', env.str('DATABASE_HOST', 'localhost'))}:{env.str('DB_PORT', env.str('DATABASE_PORT', '5432'))}/{env.str('DB_NAME', env.str('DATABASE_NAME', 'pinesphere_db'))}"
    )
    DATABASES = {
        "default": env.db(default=db_url)
    }

AUTH_USER_MODEL = "authentication.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000",
    cast=Csv(),
)

REDIS_URL = config("REDIS_URL", default="redis://localhost:6379/0")


def _normalize_signing_key(raw_value: str, fallback_value: str) -> str:
    candidate = (raw_value or "").strip() or (fallback_value or "").strip()
    if len(candidate) >= 32:
        return candidate
    digest_source = candidate or fallback_value or SECRET_KEY
    return hashlib.sha256(digest_source.encode("utf-8")).hexdigest()


JWT_SECRET = _normalize_signing_key(config("JWT_SECRET", default=""), SECRET_KEY)
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")
FRONTEND_OAUTH_CALLBACK_URL = config(
    "FRONTEND_OAUTH_CALLBACK_URL",
    default=f"{FRONTEND_URL}/oauth/callback",
)
GOOGLE_OAUTH_CLIENT_ID = config("GOOGLE_OAUTH_CLIENT_ID", default="")
GOOGLE_OAUTH_CLIENT_SECRET = config("GOOGLE_OAUTH_CLIENT_SECRET", default="")
GOOGLE_OAUTH_REDIRECT_URI = config(
    "GOOGLE_OAUTH_REDIRECT_URI",
    default="http://localhost:8000/auth/oauth/google/callback/",
)
GOOGLE_OAUTH_AUTH_URL = config(
    "GOOGLE_OAUTH_AUTH_URL",
    default="https://accounts.google.com/o/oauth2/v2/auth",
)
GOOGLE_OAUTH_TOKEN_URL = config(
    "GOOGLE_OAUTH_TOKEN_URL",
    default="https://oauth2.googleapis.com/token",
)
GOOGLE_OAUTH_USERINFO_URL = config(
    "GOOGLE_OAUTH_USERINFO_URL",
    default="https://openidconnect.googleapis.com/v1/userinfo",
)

FAST2SMS_API_KEY = config("FAST2SMS_API_KEY", default="")
FAST2SMS_DLT_SENDER_ID = config("FAST2SMS_DLT_SENDER_ID", default="")
FAST2SMS_DLT_MESSAGE_ID = config("FAST2SMS_DLT_MESSAGE_ID", default="")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    # AllowAny globally — each view declares its own permission_classes.
    # Using IsAuthenticated here caused public endpoints (login, register) to
    # return 401 when the JWT auth backend ran on unauthenticated requests.
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    # Use the pinesphere global exception handler to enforce the API envelope
    "EXCEPTION_HANDLER": "pinesphere.core.exceptions.custom_exception_handler",
    # Default pagination for the API
    "DEFAULT_PAGINATION_CLASS": "pinesphere.core.pagination.StandardPageNumberPagination",
    "PAGE_SIZE": 25,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=24),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": JWT_SECRET,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# Channels configuration
# Channels configuration: prefer Redis if provided, otherwise in-memory.
_channel_redis = env.str("CHANNEL_LAYERS_REDIS", default=env.str("REDIS_URL", default=""))
if _channel_redis:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [_channel_redis]},
        }
    }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
    }

# Cache configuration.
# Uses Redis in production (set REDIS_URL). Falls back to in-memory cache
# for local development when Redis is not running.
_redis_url = env.str("REDIS_URL", default="")
if _redis_url and not DEBUG:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": _redis_url,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }

# Celery Configuration
CELERY_BROKER_URL = env.str("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env.str("REDIS_URL", default="redis://localhost:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"

# Razorpay API Configuration (Loaded via django-environ)
RAZORPAY_KEY_ID = env.str("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = env.str("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = env.str("RAZORPAY_WEBHOOK_SECRET")

# ------------------------
# Email configuration (optional)
# ------------------------
EMAIL_HOST = config("EMAIL_HOST", default="localhost")
EMAIL_PORT = int(config("EMAIL_PORT", default="25") or 25)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=False, cast=bool)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=False, cast=bool)

