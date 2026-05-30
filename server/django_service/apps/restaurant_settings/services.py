from __future__ import annotations

from copy import deepcopy
from typing import Any
from uuid import uuid4

from django.db import transaction

from authentication.models import Restaurant
from .models import RestaurantSettings


SYSTEM_ROLE_NAMES = ["Admin", "Manager", "Chef", "Cashier", "Waiter"]

ROLE_PRESETS = {
    "Admin": {"color": "slate", "icon": "shield", "is_system": True},
    "Manager": {"color": "blue", "icon": "badge-check", "is_system": True},
    "Chef": {"color": "emerald", "icon": "chef-hat", "is_system": True},
    "Cashier": {"color": "amber", "icon": "calculator", "is_system": True},
    "Waiter": {"color": "violet", "icon": "user-round", "is_system": True},
}

PERMISSION_CATALOG = [
    {"key": "orders", "label": "Orders", "actions": ["view", "edit", "delete"]},
    {"key": "menu", "label": "Menu", "actions": ["view", "edit", "delete"]},
    {"key": "kds", "label": "KDS", "actions": ["view", "edit", "delete"]},
    {"key": "reports", "label": "Reports", "actions": ["view", "edit", "delete"]},
    {"key": "staff", "label": "Staff", "actions": ["view", "edit", "delete"]},
    {"key": "settings", "label": "Settings", "actions": ["view", "edit", "delete"]},
]

DEFAULT_DAYS = [
    {"day": 0, "closed": False, "open": "09:00", "close": "22:00"},
    {"day": 1, "closed": False, "open": "09:00", "close": "22:00"},
    {"day": 2, "closed": False, "open": "09:00", "close": "22:00"},
    {"day": 3, "closed": False, "open": "09:00", "close": "22:00"},
    {"day": 4, "closed": False, "open": "09:00", "close": "22:00"},
    {"day": 5, "closed": False, "open": "10:00", "close": "23:00"},
    {"day": 6, "closed": False, "open": "10:00", "close": "23:00"},
]

DEFAULT_PAYMENT_SETTINGS = {
    "accepted_payment_methods": {"cash": True, "card": True, "tap": True, "qr": False},
    "tax_rates": [],
    "service_charge": {"type": "percentage", "value": 0, "auto_apply": False, "applies_to": "all"},
    "tip_presets": [15, 18, 20, "custom"],
    "rounding_rule": "0.01",
    "terminal_ids": {"stripe": "", "square": ""},
}

DEFAULT_NOTIFICATION_SETTINGS = {
    "email": {"new_order": True, "low_inventory": True, "shift_reminder": True, "daily_report": False},
    "sms": {"new_order": False, "low_inventory": False, "shift_reminder": False, "daily_report": False},
    "sms_phone": "",
    "role_preferences": {"Admin": True, "Manager": True, "Chef": True, "Cashier": False, "Waiter": False},
    "escalation_minutes": 10,
    "summary_schedule": "0 8 * * *",
}

DEFAULT_SECURITY_SETTINGS = {
    "session_timeout": 60,
    "pin_login_enabled": True,
    "totp_enabled": False,
    "ip_allowlist": [],
    "audit_log_retention_days": 90,
    "password_policy": {"min_length": 8, "uppercase": True, "number": True, "symbol": False},
}

DEFAULT_INTEGRATION_SETTINGS = {
    "pos": {"stripe": {"connected": False}, "square": {"connected": False}},
    "delivery_platforms": {
        "doordash": {"enabled": False, "api_key": ""},
        "ubereats": {"enabled": False, "api_key": ""},
        "grubhub": {"enabled": False, "api_key": ""},
    },
    "accounting": {"quickbooks": {"connected": False}, "xero": {"connected": False}},
    "reservation": {"opentable": {"enabled": False, "api_key": ""}, "resy": {"enabled": False, "api_key": ""}},
    "loyalty": {"enabled": False, "api_key": ""},
    "webhooks": {"order_events": "", "status_changes": ""},
}

DEFAULT_OPERATING_HOURS = deepcopy(DEFAULT_DAYS)


def build_default_role_permissions() -> dict[str, bool]:
    return {f"{group['key']}_{action}": False for group in PERMISSION_CATALOG for action in group["actions"]}


def build_system_role_payload(name: str) -> dict[str, Any]:
    permissions = build_default_role_permissions()
    if name == "Admin":
        permissions = {key: True for key in permissions}
    elif name == "Manager":
        for key in permissions:
            permissions[key] = key.startswith(("orders_", "menu_", "reports_", "staff_", "settings_"))
    elif name == "Chef":
        for key in permissions:
            permissions[key] = key.startswith(("orders_", "menu_", "kds_"))
    elif name == "Cashier":
        for key in permissions:
            permissions[key] = key.startswith("orders_")
    elif name == "Waiter":
        for key in permissions:
            permissions[key] = key.startswith(("orders_", "menu_"))

    preset = ROLE_PRESETS.get(name, {"color": "slate", "icon": "circle", "is_system": True})
    return {
        "name": name,
        "color": preset["color"],
        "icon": preset["icon"],
        "is_system": preset["is_system"],
        "permissions": permissions,
    }


def ensure_settings(restaurant: Restaurant) -> RestaurantSettings:
    settings, _ = RestaurantSettings.objects.get_or_create(restaurant=restaurant)
    if not settings.operating_hours:
        settings.operating_hours = deepcopy(DEFAULT_OPERATING_HOURS)
    if not settings.payment_settings:
        settings.payment_settings = deepcopy(DEFAULT_PAYMENT_SETTINGS)
    if not settings.notification_settings:
        settings.notification_settings = deepcopy(DEFAULT_NOTIFICATION_SETTINGS)
    if not settings.security_settings:
        settings.security_settings = deepcopy(DEFAULT_SECURITY_SETTINGS)
    if not settings.integration_settings:
        settings.integration_settings = deepcopy(DEFAULT_INTEGRATION_SETTINGS)
    settings.save()
    return settings


@transaction.atomic
def update_restaurant_profile(restaurant: Restaurant, payload: dict[str, Any]) -> RestaurantSettings:
    settings = ensure_settings(restaurant)

    restaurant.name = payload.get("name", restaurant.name).strip() or restaurant.name
    restaurant.address = payload.get("address", restaurant.address)
    restaurant.phone = payload.get("phone", restaurant.phone)
    restaurant.email = payload.get("email", restaurant.email)
    restaurant.timezone = payload.get("default_timezone", restaurant.timezone)
    restaurant.save(update_fields=["name", "address", "phone", "email", "timezone", "updated_at"])

    settings.tax_id = payload.get("tax_id", settings.tax_id)
    settings.default_timezone = payload.get("default_timezone", settings.default_timezone)
    settings.currency = payload.get("currency", settings.currency)
    settings.language = payload.get("language", settings.language)
    settings.locale = payload.get("locale", settings.locale)
    settings.table_count = int(payload.get("table_count", settings.table_count) or 0)
    settings.floor_capacity = int(payload.get("floor_capacity", settings.floor_capacity) or 0)
    if "operating_hours" in payload:
        settings.operating_hours = payload.get("operating_hours") or []
    settings.save()
    return settings


def serialize_restaurant_profile(restaurant: Restaurant, settings: RestaurantSettings) -> dict[str, Any]:
    return {
        "id": str(restaurant.id),
        "name": restaurant.name,
        "address": restaurant.address,
        "phone": restaurant.phone,
        "email": restaurant.email,
        "default_timezone": settings.default_timezone or restaurant.timezone,
        "currency": settings.currency,
        "language": settings.language,
        "locale": settings.locale,
        "tax_id": settings.tax_id,
        "operating_hours": settings.operating_hours or deepcopy(DEFAULT_OPERATING_HOURS),
        "table_count": settings.table_count,
        "floor_capacity": settings.floor_capacity,
        "logo": settings.logo.url if settings.logo else None,
        "is_active": restaurant.is_active,
        "created_at": restaurant.created_at,
        "updated_at": restaurant.updated_at,
    }


def merge_settings_blob(settings: RestaurantSettings, field_name: str, default_value: Any) -> Any:
    value = getattr(settings, field_name, None)
    if value:
        return value
    return deepcopy(default_value)


def update_settings_blob(settings: RestaurantSettings, field_name: str, value: Any) -> RestaurantSettings:
    setattr(settings, field_name, value)
    settings.save(update_fields=[field_name, "updated_at"])
    return settings


def upsert_list_item(items: list[dict[str, Any]], payload: dict[str, Any], *, system_lock: bool = False) -> list[dict[str, Any]]:
    existing_id = payload.get("id")
    if existing_id:
        for index, item in enumerate(items):
            if str(item.get("id")) == str(existing_id):
                if system_lock and item.get("is_system"):
                    raise ValueError("System items are read-only")
                updated = {**item, **payload, "id": item.get("id", existing_id)}
                items[index] = updated
                return items
    new_item = {**payload}
    new_item.setdefault("id", str(uuid4()))
    items.append(new_item)
    return items


def remove_list_item(items: list[dict[str, Any]], item_id: str, *, system_lock: bool = False) -> list[dict[str, Any]]:
    next_items: list[dict[str, Any]] = []
    removed = False
    for item in items:
        if str(item.get("id")) == str(item_id):
            if system_lock and item.get("is_system"):
                raise ValueError("System items are read-only")
            removed = True
            continue
        next_items.append(item)
    if not removed:
        raise ValueError("Item not found")
    return next_items


def reorder_list_items(items: list[dict[str, Any]], ordered_ids: list[str]) -> list[dict[str, Any]]:
    lookup = {str(item.get("id")): item for item in items}
    reordered: list[dict[str, Any]] = []
    for index, item_id in enumerate(ordered_ids):
        item = lookup.get(str(item_id))
        if not item:
            continue
        reordered_item = {**item, "sort_order": index}
        reordered.append(reordered_item)
    for item in items:
        if str(item.get("id")) not in set(str(value) for value in ordered_ids):
            reordered.append(item)
    return reordered
