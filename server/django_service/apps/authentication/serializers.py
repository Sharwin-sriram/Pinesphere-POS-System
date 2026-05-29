"""Serializers for authentication app."""

from rest_framework import serializers
from authentication.models import Branch, Restaurant


class BranchSerializer(serializers.ModelSerializer):
    """Serializer for Branch model."""

    class Meta:
        model = Branch
        fields = [
            "id",
            "name",
            "address",
            "phone",
            "manager_name",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class RestaurantSerializer(serializers.ModelSerializer):
    """Serializer for Restaurant model."""

    branches = BranchSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "address",
            "phone",
            "email",
            "timezone",
            "is_active",
            "branches",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
