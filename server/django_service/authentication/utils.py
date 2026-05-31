"""OTP helpers backed by Django cache and Fast2SMS."""

from __future__ import annotations

import random

import requests
from django.conf import settings
from django.core.cache import cache
from requests import RequestException
from rest_framework.exceptions import APIException


FAST2SMS_OTP_URL = "https://www.fast2sms.com/dev/bulkV2"
OTP_CACHE_TIMEOUT_SECONDS = 10 * 60


class Fast2SMSError(APIException):
    status_code = 502
    default_detail = "OTP provider request failed"
    default_code = "otp_provider_failed"


def _normalize_mobile(mobile: str) -> str:
    """Normalize mobile number into digits accepted by Fast2SMS."""

    raw_mobile = (mobile or "").strip()
    if not raw_mobile:
        raise ValueError("mobile is required")

    digits = "".join(character for character in raw_mobile if character.isdigit())
    if not digits:
        raise ValueError("mobile is invalid")

    if len(digits) == 12 and digits.startswith("91"):
        return digits[2:]
    if len(digits) == 10:
        return digits

    raise ValueError("mobile must contain a valid 10-digit number")


def _cache_key(mobile: str) -> str:
    return f"otp_{mobile}"


def _fast2sms_api_key() -> str:
    return (settings.FAST2SMS_API_KEY or "").strip()


def _fast2sms_dlt_config() -> tuple[str, str]:
    sender_id = (getattr(settings, "FAST2SMS_DLT_SENDER_ID", "") or "").strip()
    message_id = (getattr(settings, "FAST2SMS_DLT_MESSAGE_ID", "") or "").strip()
    return sender_id, message_id


def _post_fast2sms(payload: dict) -> dict:
    api_key = _fast2sms_api_key()
    if not api_key:
        raise RuntimeError("Fast2SMS is not configured. Set FAST2SMS_API_KEY.")

    headers = {
        "authorization": api_key,
        "accept": "*/*",
        "cache-control": "no-cache",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(FAST2SMS_OTP_URL, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
    except RequestException as exc:
        response_text = getattr(getattr(exc, "response", None), "text", "")
        detail = response_text.strip() if response_text else str(exc)
        raise Fast2SMSError(f"Fast2SMS request failed: {detail}") from exc

    try:
        return response.json() if response.content else {}
    except ValueError:
        return {}


def _send_fast2sms_otp(mobile_number: str, otp: str) -> dict:
    payload = {
        "route": "otp",
        "variables_values": otp,
        "numbers": mobile_number,
        "flash": 0,
    }
    return _post_fast2sms(payload)


def _send_fast2sms_dlt(mobile_number: str, otp: str) -> dict:
    sender_id, message_id = _fast2sms_dlt_config()
    if not (sender_id and message_id):
        raise Fast2SMSError(
            "Fast2SMS OTP Message API is blocked until website verification is complete. "
            "Configure FAST2SMS_DLT_SENDER_ID and FAST2SMS_DLT_MESSAGE_ID to use the DLT SMS fallback."
        )

    payload = {
        "route": "dlt",
        "sender_id": sender_id,
        "message": message_id,
        "variables_values": otp,
        "numbers": mobile_number,
        "sms_details": 0,
    }
    return _post_fast2sms(payload)


def send_otp(mobile: str) -> str:
    """Generate, cache, and send a login OTP through Fast2SMS."""

    mobile_number = _normalize_mobile(mobile)

    otp = f"{random.randint(0, 999999):06d}"
    response_data = _send_fast2sms_otp(mobile_number, otp)

    if response_data.get("status_code") == 996:
        response_data = _send_fast2sms_dlt(mobile_number, otp)

    if response_data.get("return") is False or response_data.get("status_code") not in (None, 200):
        error_message = response_data.get("message") or response_data.get("detail") or "Failed to send OTP via Fast2SMS"
        raise Fast2SMSError(error_message)

    cache.set(_cache_key(mobile), otp, timeout=OTP_CACHE_TIMEOUT_SECONDS)
    return otp


def verify_otp(mobile: str, otp_entered: str) -> str:
    """Verify cached OTP for mobile and clear it on success.

    Returns one of: "ok", "expired", "wrong".
    """

    key = _cache_key(mobile)
    stored_otp = cache.get(key)

    if stored_otp is None:
        return "expired"
    if str(stored_otp) != str(otp_entered):
        return "wrong"

    cache.delete(key)
    return "ok"