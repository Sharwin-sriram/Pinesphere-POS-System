from rest_framework import serializers
from . import models


class KOTItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.KOTItem
        fields = ['id', 'menu_item', 'qty', 'status', 'modifiers', 'notes']


class KOTSerializer(serializers.ModelSerializer):
    items = KOTItemSerializer(many=True)

    class Meta:
        model = models.KOT
        fields = ['id', 'order', 'kot_number', 'branch', 'station', 'status', 'printed_count', 'items']
