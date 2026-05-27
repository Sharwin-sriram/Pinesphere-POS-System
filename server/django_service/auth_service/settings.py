"""Project settings for the authentication service."""

from datetime import timedelta
from pathlib import Path

from decouple import Csv, config


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY", default="django-insecure-change-me")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

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
    "apps.orders",
    "apps.inventory",
    "apps.pos",
    "apps.kitchen_display_system",
]

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

# Database configuration: require PostgreSQL settings via environment variables.
# The app will raise an error at startup if required DB vars are missing.
# Prefer `DB_NAME`/`DB_*` variables, but accept legacy `DATABASE_NAME`/`DATABASE_*` keys
DB_NAME = config("DB_NAME", default=None)
if not DB_NAME:
    DB_NAME = config("DATABASE_NAME", default=None)
if not DB_NAME:
    raise RuntimeError("Database not configured: set DB_NAME or DATABASE_NAME in environment")

DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE", default="django.db.backends.postgresql"),
        "NAME": DB_NAME,
        "USER": config("DB_USER", default=config("DATABASE_USER", default="postgres")),
        "PASSWORD": config("DB_PASSWORD", default=config("DATABASE_PASSWORD", default="")),
        "HOST": config("DB_HOST", default=config("DATABASE_HOST", default="localhost")),
        "PORT": config("DB_PORT", default=config("DATABASE_PORT", default="5432")),
    }
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
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000",
    cast=Csv(),
)

REDIS_URL = config("REDIS_URL", default="redis://localhost:6379/0")
JWT_SECRET = config("JWT_SECRET", default=SECRET_KEY)
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

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "EXCEPTION_HANDLER": "auth_service.exceptions.custom_exception_handler",
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
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}