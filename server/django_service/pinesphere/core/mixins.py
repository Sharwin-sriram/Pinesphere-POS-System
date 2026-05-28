from django.utils import timezone
from django.apps import apps
from rest_framework.response import Response


class TenantQuerysetMixin:
    """Mixin providing helper to filter a queryset by tenant (restaurant) found on request.user."""

    def filter_by_tenant(self, queryset, request):
        user = getattr(request, "user", None)
        tenant = getattr(user, "restaurant", None)
        if tenant is None:
            return queryset.none()
        return queryset.filter(restaurant=tenant)


class SoftDeleteMixin:
    def filter_active(self, queryset):
        return queryset.filter(deleted_at__isnull=True)


class AuditLogMixin:
    """Write a row to audit_logs table on create/update/delete actions.

    Assumes an `AuditLog` model exists in `audit` app with fields:
    user, tenant, action, model_name, object_id, payload_diff, ip_address, timestamp
    If model is not present, the mixin will silently skip logging.
    """

    def log_audit(self, request, action: str, instance=None, payload_diff=None):
        try:
            AuditLog = apps.get_model("audit", "AuditLog")
        except LookupError:
            return

        user = getattr(request, "user", None)
        tenant = getattr(user, "restaurant", None) if user else None
        model_name = instance.__class__.__name__ if instance is not None else None
        object_id = getattr(instance, "id", None) if instance is not None else None
        ip = request.META.get("REMOTE_ADDR") if hasattr(request, "META") else None

        AuditLog.objects.create(
            user=user,
            tenant=tenant,
            action=action,
            model_name=model_name,
            object_id=object_id,
            payload_diff=payload_diff or {},
            ip_address=ip,
            timestamp=timezone.now(),
        )
