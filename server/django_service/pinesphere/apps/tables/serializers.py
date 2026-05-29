from rest_framework import serializers
from . import models


class TableWriteSerializer(serializers.Serializer):
    branch_id = serializers.IntegerField()
    name = serializers.CharField()
    capacity = serializers.IntegerField(min_value=1)
    floor_id = serializers.IntegerField(required=False, allow_null=True)
    metadata = serializers.JSONField(required=False)


class TableReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Table
        fields = ['id', 'branch', 'floor', 'name', 'capacity', 'status', 'current_order', 'is_merged', 'merged_into', 'metadata']


class StatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[c[0] for c in models.Table.STATUSES])


class MergeSerializer(serializers.Serializer):
    table_ids = serializers.ListField(child=serializers.IntegerField(), min_length=2)
    target_table_id = serializers.IntegerField()


class SplitSerializer(serializers.Serializer):
    table_id = serializers.IntegerField()
    new_table_data = serializers.ListField(child=serializers.DictField())
