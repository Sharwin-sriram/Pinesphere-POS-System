from rest_framework.permissions import BasePermission


class IsRestaurantAdminOrOwner(BasePermission):
    """Allow access to restaurant owners, branch managers, and super admins."""

    allowed_roles = {"SUPER_ADMIN", "ORGANIZATION_OWNER", "BRANCH_MANAGER"}

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return getattr(user, "role", None) in self.allowed_roles
