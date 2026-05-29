from __future__ import annotations

import socket
from datetime import time
from uuid import UUID, uuid4

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_time
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from authentication.models import Restaurant
from apps.pos.models import MenuCategory, Role, Shift, StaffMember
from apps.kitchen_display_system.models import KdsStation, PrinterConfiguration, KitchenDisplaySystem
from .models import RestaurantSettings
from .permissions import IsRestaurantAdminOrOwner
from .serializers import (
    IntegrationSettingsSerializer,
    KdsStationSerializer,
    MenuCategorySerializer,
    NotificationSettingsSerializer,
    PaymentSettingsSerializer,
    PermissionEnumSerializer,
    PrinterSerializer,
    RestaurantProfileSerializer,
    RoleSerializer,
    SecuritySettingsSerializer,
    ShiftSerializer,
)
from .services import (
    DEFAULT_INTEGRATION_SETTINGS,
    DEFAULT_NOTIFICATION_SETTINGS,
    DEFAULT_OPERATING_HOURS,
    DEFAULT_PAYMENT_SETTINGS,
    DEFAULT_SECURITY_SETTINGS,
    PERMISSION_CATALOG,
    SYSTEM_ROLE_NAMES,
    build_default_role_permissions,
    build_system_role_payload,
    ensure_settings,
    merge_settings_blob,
    reorder_list_items,
    remove_list_item,
    serialize_restaurant_profile,
    update_restaurant_profile,
    update_settings_blob,
    upsert_list_item,
)


def _success(data=None, *, status_code=status.HTTP_200_OK):
    return Response({"success": True, "data": data}, status=status_code)


def _error(code: str, message: str, *, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "error": {"code": code, "message": message}}, status=status_code)


def _clean_restaurant_id(value) -> str | None:
    if value in (None, "", "null", "undefined"):
        return None

    restaurant_id = str(value).strip()
    if not restaurant_id or restaurant_id.lower() in {"null", "undefined"}:
        return None

    try:
        return str(UUID(restaurant_id))
    except (TypeError, ValueError, AttributeError):
        return None


def _resolve_restaurant_for_user(user) -> Restaurant | None:
    if not user or not getattr(user, "is_authenticated", False):
        return None

    restaurant_id = _clean_restaurant_id(getattr(user, "restaurant_id", None))
    if restaurant_id:
        restaurant = Restaurant.objects.filter(pk=restaurant_id).first()
        if restaurant is not None:
            return restaurant

    if getattr(user, "role", None) == "ORGANIZATION_OWNER" and getattr(user, "email", None):
        return Restaurant.objects.filter(email__iexact=user.email).first()

    return None


def _restaurant_from_request(request) -> Restaurant:
    token_restaurant_id = None
    auth = getattr(request, "auth", None)
    if auth is not None and hasattr(auth, "get"):
        token_restaurant_id = auth.get("restaurant_id")

    restaurant_id = (
        _clean_restaurant_id(getattr(request.user, "restaurant_id", None))
        or _clean_restaurant_id(token_restaurant_id)
        or _clean_restaurant_id(request.query_params.get("restaurant_id"))
    )
    if not restaurant_id:
        restaurant = _resolve_restaurant_for_user(request.user)
        if restaurant is not None:
            return restaurant
        raise ValueError("Restaurant context not found")

    try:
        restaurant = Restaurant.objects.filter(pk=restaurant_id).first()
    except (ValidationError, ValueError, TypeError):
        restaurant = None
    if restaurant is None:
        raise ValueError("Restaurant context not found")
    return restaurant


def _normalize_time(value):
    if value in (None, ""):
        return None
    if isinstance(value, time):
        return value
    parsed = parse_time(str(value))
    if parsed is None:
        raise ValueError(f"Invalid time value: {value}")
    return parsed


def _seed_system_roles(restaurant_id: str) -> None:
    existing = {role.name.lower() for role in Role.objects.filter(restaurant_id=restaurant_id)}
    for role_name in SYSTEM_ROLE_NAMES:
        if role_name.lower() in existing:
            continue
        payload = build_system_role_payload(role_name)
        Role.objects.create(restaurant_id=restaurant_id, sort_order=SYSTEM_ROLE_NAMES.index(role_name), **payload)


def _serialize_role(role: Role) -> dict:
    return {
        **RoleSerializer(role).data,
        "staff_count": StaffMember.objects.filter(restaurant_id=role.restaurant_id, role=role.name).count(),
    }


def _serialize_menu_category(category: MenuCategory) -> dict:
    return MenuCategorySerializer(category).data


def _serialize_station(station: KdsStation) -> dict:
    return KdsStationSerializer(station).data


def _serialize_shift(shift: Shift) -> dict:
    data = ShiftSerializer(shift).data
    data["staff_count"] = len(data.get("staff_assignments") or [])
    return data


def _serialize_printer(printer: PrinterConfiguration) -> dict:
    return PrinterSerializer(printer).data


@api_view(["GET", "PUT"])
@permission_classes([IsRestaurantAdminOrOwner])
def restaurant_settings_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)

    if request.method == "GET":
        return _success(serialize_restaurant_profile(restaurant, settings))

    serializer = RestaurantProfileSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    update_restaurant_profile(restaurant, serializer.validated_data)
    settings = ensure_settings(restaurant)
    return _success(serialize_restaurant_profile(restaurant, settings))


@api_view(["POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def restaurant_logo_upload_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    logo = request.FILES.get("logo") or request.FILES.get("file")
    if not logo:
        return _error("logo_missing", "Logo file is required", status_code=status.HTTP_400_BAD_REQUEST)

    settings.logo = logo
    settings.save(update_fields=["logo", "updated_at"])
    return _success({"logo": settings.logo.url if settings.logo else None})


@api_view(["GET"])
@permission_classes([IsRestaurantAdminOrOwner])
def permissions_list_view(request):
    return _success(PermissionEnumSerializer(PERMISSION_CATALOG, many=True).data)


@api_view(["GET", "POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def roles_list_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    _seed_system_roles(str(restaurant.id))

    if request.method == "GET":
        roles = Role.objects.filter(restaurant_id=str(restaurant.id)).order_by("sort_order", "name")
        return _success([_serialize_role(role) for role in roles])

    serializer = RoleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    role = Role.objects.create(
        restaurant_id=str(restaurant.id),
        name=data["name"],
        color=data.get("color", "slate"),
        icon=data.get("icon", ""),
        permissions=data.get("permissions", build_default_role_permissions()),
        sort_order=data.get("sort_order", 0),
        is_system=False,
    )
    return _success(_serialize_role(role), status_code=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def role_detail_view(request, role_id):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    role = get_object_or_404(Role, pk=role_id, restaurant_id=str(restaurant.id))
    if role.is_system:
        return _error("system_role_locked", "System roles are read-only", status_code=status.HTTP_403_FORBIDDEN)

    if request.method == "DELETE":
        if StaffMember.objects.filter(restaurant_id=str(restaurant.id), role=role.name).exists():
            return _error("role_in_use", "Cannot delete a role assigned to staff", status_code=status.HTTP_400_BAD_REQUEST)
        role.delete()
        return _success({"deleted": True})

    serializer = RoleSerializer(role, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return _success(_serialize_role(role))


@api_view(["GET"])
@permission_classes([IsRestaurantAdminOrOwner])
def menu_categories_list_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    categories = MenuCategory.objects.filter(restaurant_id=str(restaurant.id)).order_by("sort_order", "name")
    return _success([_serialize_menu_category(category) for category in categories])


@api_view(["POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def menu_categories_create_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    serializer = MenuCategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    category = MenuCategory.objects.create(
        restaurant_id=str(restaurant.id),
        name=data["name"],
        description=data.get("description", ""),
        emoji=data.get("emoji", ""),
        color=data.get("color", "slate"),
        is_active=data.get("is_active", True),
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        kds_station_id=str(data.get("kds_station_id") or ""),
        parent_id=str(data.get("parent_id") or ""),
        sort_order=data.get("sort_order", 0),
    )
    return _success(_serialize_menu_category(category), status_code=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def menu_category_detail_view(request, category_id):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    category = get_object_or_404(MenuCategory, pk=category_id, restaurant_id=str(restaurant.id))
    if request.method == "DELETE":
        category.delete()
        return _success({"deleted": True})

    serializer = MenuCategorySerializer(category, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return _success(_serialize_menu_category(category))


@api_view(["PUT"])
@permission_classes([IsRestaurantAdminOrOwner])
def menu_categories_reorder_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    ordered_ids = request.data.get("ordered_ids") or []
    categories = list(MenuCategory.objects.filter(restaurant_id=str(restaurant.id)).values("id", "name", "description", "emoji", "color", "is_active", "start_time", "end_time", "kds_station_id", "parent_id", "sort_order", "created_at", "updated_at"))
    reordered = reorder_list_items(categories, [str(item_id) for item_id in ordered_ids])
    for item in reordered:
        MenuCategory.objects.filter(pk=item["id"]).update(sort_order=item.get("sort_order", 0))
    updated = MenuCategory.objects.filter(restaurant_id=str(restaurant.id)).order_by("sort_order", "name")
    return _success([_serialize_menu_category(category) for category in updated])


@api_view(["GET", "POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def kds_stations_list_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        stations = KdsStation.objects.filter(restaurant=restaurant).order_by("sort_order", "name")
        return _success([_serialize_station(station) for station in stations])

    serializer = KdsStationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    station = KdsStation.objects.create(restaurant=restaurant, **serializer.validated_data)
    return _success(_serialize_station(station), status_code=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def kds_station_detail_view(request, station_id):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    station = get_object_or_404(KdsStation, pk=station_id, restaurant=restaurant)
    if request.method == "DELETE":
        station.delete()
        return _success({"deleted": True})

    serializer = KdsStationSerializer(station, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return _success(_serialize_station(station))


@api_view(["GET", "POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def shifts_list_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        shifts = Shift.objects.filter(restaurant_id=str(restaurant.id)).order_by("sort_order", "start_time")
        return _success([_serialize_shift(shift) for shift in shifts])

    serializer = ShiftSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    shift = Shift.objects.create(
        restaurant_id=str(restaurant.id),
        name=data["name"],
        start_time=data["start_time"],
        end_time=data["end_time"],
        days_of_week=data.get("days_of_week", []),
        role_ids=data.get("role_ids", []),
        min_staff=data.get("min_staff", 0),
        staff_assignments=data.get("staff_assignments", []),
        overtime_threshold_hours=data.get("overtime_threshold_hours", 40),
        allow_swaps=data.get("allow_swaps", True),
        sort_order=data.get("sort_order", 0),
    )
    return _success(_serialize_shift(shift), status_code=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def shift_detail_view(request, shift_id):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    shift = get_object_or_404(Shift, pk=shift_id, restaurant_id=str(restaurant.id))
    if request.method == "DELETE":
        shift.delete()
        return _success({"deleted": True})

    serializer = ShiftSerializer(shift, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return _success(_serialize_shift(shift))


@api_view(["GET"])
@permission_classes([IsRestaurantAdminOrOwner])
def shift_coverage_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    shifts = Shift.objects.filter(restaurant_id=str(restaurant.id))
    staff_by_role = StaffMember.objects.filter(restaurant_id=str(restaurant.id)).values("role").annotate(total=Count("id"))
    staff_lookup = {row["role"]: row["total"] for row in staff_by_role}

    coverage = []
    for shift in shifts:
        role_names = [str(role_id) for role_id in (shift.role_ids or [])]
        coverage.append(
            {
                **_serialize_shift(shift),
                "role_coverage": [
                    {
                        "role": role_name,
                        "assigned": staff_lookup.get(role_name, 0),
                        "minimum": shift.min_staff,
                    }
                    for role_name in role_names or ["Unassigned"]
                ],
            }
        )

    return _success({"week": request.query_params.get("week"), "shifts": coverage})


@api_view(["GET", "POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def printers_list_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    kds = KitchenDisplaySystem.objects.filter(restaurant=restaurant).first()

    if request.method == "GET":
        printers = PrinterConfiguration.objects.filter(kds=kds) if kds else PrinterConfiguration.objects.none()
        return _success([_serialize_printer(printer) for printer in printers])

    serializer = PrinterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    if not kds:
        kds = KitchenDisplaySystem.objects.create(restaurant=restaurant)
    printer = PrinterConfiguration.objects.create(kds=kds, **serializer.validated_data)
    return _success(_serialize_printer(printer), status_code=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def printer_detail_view(request, printer_id):
    printer = get_object_or_404(PrinterConfiguration, pk=printer_id)
    if request.method == "DELETE":
        printer.delete()
        return _success({"deleted": True})

    serializer = PrinterSerializer(printer, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return _success(_serialize_printer(printer))


@api_view(["POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def printer_test_view(request, printer_id):
    printer = get_object_or_404(PrinterConfiguration, pk=printer_id)
    host = printer.printer_address
    port = int(printer.port_number or 9100)
    connected = False
    message = "Printer connection failed"

    if host:
        try:
            with socket.create_connection((host, port), timeout=3):
                connected = True
                message = "Printer connection successful"
        except OSError:
            connected = False
            message = "Printer connection failed"

    return _success({"printer_id": str(printer.id), "connected": connected, "message": message})


@api_view(["GET", "PUT"])
@permission_classes([IsRestaurantAdminOrOwner])
def payment_settings_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    if request.method == "GET":
        return _success(merge_settings_blob(settings, "payment_settings", DEFAULT_PAYMENT_SETTINGS))

    serializer = PaymentSettingsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    update_settings_blob(settings, "payment_settings", serializer.validated_data)
    return _success(merge_settings_blob(settings, "payment_settings", DEFAULT_PAYMENT_SETTINGS))


@api_view(["GET", "POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def tax_rates_list_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    payment_settings = merge_settings_blob(settings, "payment_settings", DEFAULT_PAYMENT_SETTINGS)
    tax_rates = payment_settings.get("tax_rates", [])

    if request.method == "GET":
        return _success(tax_rates)

    serializer = PaymentSettingsSerializer(data={"tax_rates": [request.data]})
    serializer.is_valid(raise_exception=True)
    tax_rate = {**request.data}
    tax_rate.setdefault("id", str(uuid4()))
    tax_rates.append(tax_rate)
    payment_settings["tax_rates"] = tax_rates
    update_settings_blob(settings, "payment_settings", payment_settings)
    return _success(tax_rate, status_code=status.HTTP_201_CREATED)


@api_view(["PUT", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def tax_rate_detail_view(request, tax_rate_id):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    payment_settings = merge_settings_blob(settings, "payment_settings", DEFAULT_PAYMENT_SETTINGS)
    tax_rates = payment_settings.get("tax_rates", [])
    updated_rates = []
    found = False
    for tax_rate in tax_rates:
        if str(tax_rate.get("id")) != str(tax_rate_id):
            updated_rates.append(tax_rate)
            continue
        found = True
        if request.method == "DELETE":
            continue
        updated_rates.append({**tax_rate, **request.data, "id": tax_rate.get("id")})
    if not found:
        return _error("tax_rate_not_found", "Tax rate not found", status_code=status.HTTP_404_NOT_FOUND)
    payment_settings["tax_rates"] = updated_rates
    update_settings_blob(settings, "payment_settings", payment_settings)
    if request.method == "DELETE":
        return _success({"deleted": True})
    return _success(next(rate for rate in updated_rates if str(rate.get("id")) == str(tax_rate_id)))


@api_view(["GET", "PUT"])
@permission_classes([IsRestaurantAdminOrOwner])
def notifications_settings_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    if request.method == "GET":
        return _success(merge_settings_blob(settings, "notification_settings", DEFAULT_NOTIFICATION_SETTINGS))

    serializer = NotificationSettingsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    update_settings_blob(settings, "notification_settings", serializer.validated_data)
    return _success(merge_settings_blob(settings, "notification_settings", DEFAULT_NOTIFICATION_SETTINGS))


@api_view(["GET", "PUT"])
@permission_classes([IsRestaurantAdminOrOwner])
def security_settings_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    if request.method == "GET":
        return _success(merge_settings_blob(settings, "security_settings", DEFAULT_SECURITY_SETTINGS))

    serializer = SecuritySettingsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    update_settings_blob(settings, "security_settings", serializer.validated_data)
    return _success(merge_settings_blob(settings, "security_settings", DEFAULT_SECURITY_SETTINGS))


@api_view(["GET", "PUT"])
@permission_classes([IsRestaurantAdminOrOwner])
def integrations_view(request):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    if request.method == "GET":
        return _success(merge_settings_blob(settings, "integration_settings", DEFAULT_INTEGRATION_SETTINGS))

    serializer = IntegrationSettingsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    update_settings_blob(settings, "integration_settings", serializer.validated_data)
    return _success(merge_settings_blob(settings, "integration_settings", DEFAULT_INTEGRATION_SETTINGS))


@api_view(["PUT", "POST", "DELETE"])
@permission_classes([IsRestaurantAdminOrOwner])
def integration_provider_view(request, provider):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    integration_settings = merge_settings_blob(settings, "integration_settings", DEFAULT_INTEGRATION_SETTINGS)
    provider_payload = integration_settings.get(provider, {}) if isinstance(integration_settings, dict) else {}

    if request.method == "DELETE":
        if provider in integration_settings:
            integration_settings.pop(provider, None)
        update_settings_blob(settings, "integration_settings", integration_settings)
        return _success({"deleted": True})

    if request.method == "POST":
        provider_payload = {**provider_payload, "connected": True}
        integration_settings[provider] = provider_payload
        update_settings_blob(settings, "integration_settings", integration_settings)
        return _success({"provider": provider, "connected": True, "connect_url": f"/api/settings/integrations/{provider}"})

    provider_payload = {**provider_payload, **(request.data or {})}
    integration_settings[provider] = provider_payload
    update_settings_blob(settings, "integration_settings", integration_settings)
    return _success({"provider": provider, "settings": provider_payload})


@api_view(["POST"])
@permission_classes([IsRestaurantAdminOrOwner])
def integration_disconnect_view(request, provider):
    try:
        restaurant = _restaurant_from_request(request)
    except ValueError as exc:
        return _error("restaurant_context_missing", str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    settings = ensure_settings(restaurant)
    integration_settings = merge_settings_blob(settings, "integration_settings", DEFAULT_INTEGRATION_SETTINGS)
    if provider in integration_settings:
        integration_settings[provider]["connected"] = False
    update_settings_blob(settings, "integration_settings", integration_settings)
    return _success({"provider": provider, "connected": False})
