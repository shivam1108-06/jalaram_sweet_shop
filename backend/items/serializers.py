from rest_framework import serializers
from .models import Item, SKU


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for creating and displaying items"""

    inventory_unit = serializers.ReadOnlyField()

    class Meta:
        model = Item
        fields = ['id', 'name', 'category', 'sale_type', 'inventory_unit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'inventory_unit', 'is_active', 'created_at', 'updated_at']


class SKUSerializer(serializers.ModelSerializer):
    """Serializer for creating and displaying SKUs"""

    display_unit = serializers.ReadOnlyField()

    class Meta:
        model = SKU
        fields = ['id', 'item', 'code', 'unit_value', 'price', 'display_unit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'display_unit', 'is_active', 'created_at', 'updated_at']

    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be positive")
        return value
