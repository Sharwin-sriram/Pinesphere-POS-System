from rest_framework import serializers


class DailySalesSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    by_payment_mode = serializers.ListField()
    tax_collected = serializers.DecimalField(max_digits=12, decimal_places=2)
    refunds = serializers.DecimalField(max_digits=12, decimal_places=2)


class TopItemSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    name = serializers.CharField(allow_null=True)
    qty_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
