"""Centralized API exception formatting."""

from rest_framework.exceptions import APIException, AuthenticationFailed, NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


class OTPExpired(APIException):
    status_code = 400
    default_detail = "OTP expired or not found"
    default_code = "otp_expired"


class InvalidOTP(APIException):
    status_code = 400
    default_detail = "Invalid OTP"
    default_code = "invalid_otp"


class TokenExpired(AuthenticationFailed):
    default_detail = "Token expired"
    default_code = "token_expired"


class InvalidToken(AuthenticationFailed):
    default_detail = "Invalid token"
    default_code = "invalid_token"


class InvalidCredentials(AuthenticationFailed):
    default_detail = "Invalid credentials"
    default_code = "invalid_credentials"


class OAuthError(APIException):
    status_code = 400
    default_detail = "OAuth login failed"
    default_code = "oauth_failed"


class UserNotFound(NotFound):
    default_detail = "User not found"
    default_code = "user_not_found"


def custom_exception_handler(exc, context):
    """Normalize API exceptions into consistent message objects."""

    response = exception_handler(exc, context)
    if response is None:
        return response

    if isinstance(exc, ValidationError):
        return response

    if isinstance(exc, (OTPExpired, InvalidOTP, TokenExpired, InvalidToken, InvalidCredentials, OAuthError, UserNotFound, AuthenticationFailed, NotFound, APIException)):
        detail = response.data.get("detail") if isinstance(response.data, dict) else response.data
        return Response({"message": detail}, status=response.status_code)

    return response