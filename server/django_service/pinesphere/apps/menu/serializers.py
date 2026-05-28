from rest_framework import serializers
from . import models


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MenuItem
        fields = ['id', 'name', 'category', 'base_price', 'is_active', 'description', 'sku']


class MenuForBranchSerializer(serializers.Serializer):
    categories = serializers.ListField()
