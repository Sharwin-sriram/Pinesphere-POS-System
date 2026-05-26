"""Authentication endpoint routing."""

from django.urls import path

from .views import (
    EmailLoginView,
    LogoutView,
    MeUpdateView,
    MeView,
    MobileLoginView,
    GoogleOAuthCallbackView,
    GoogleOAuthStartView,
    OtpSendView,
    OtpVerifyView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    TokenRefreshView,
)


urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/email/", EmailLoginView.as_view()),
    path("login/mobile/", MobileLoginView.as_view()),
    path("oauth/google/start/", GoogleOAuthStartView.as_view()),
    path("oauth/google/callback/", GoogleOAuthCallbackView.as_view()),
    path("otp/send/", OtpSendView.as_view()),
    path("otp/verify/", OtpVerifyView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("me/update/", MeUpdateView.as_view()),
    path("password/reset/request/", PasswordResetRequestView.as_view()),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view()),
]