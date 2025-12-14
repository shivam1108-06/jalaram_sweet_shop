from rest_framework import serializers
from .models import Item, SKU, Purchase


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


class SKUListSerializer(serializers.ModelSerializer):
    """Serializer for displaying SKUs in item detail (without item field)"""

    display_unit = serializers.ReadOnlyField()

    class Meta:
        model = SKU
        fields = ['id', 'code', 'unit_value', 'price', 'display_unit']


class ItemDetailSerializer(serializers.ModelSerializer):
    """Serializer for item detail with nested SKUs"""

    inventory_unit = serializers.ReadOnlyField()
    skus = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ['id', 'name', 'category', 'sale_type', 'inventory_unit', 'inventory_qty', 'is_active', 'created_at', 'updated_at', 'skus']

    def get_skus(self, obj):
        """Return only active SKUs"""
        active_skus = obj.skus.filter(is_active=True)
        return SKUListSerializer(active_skus, many=True).data


class InventorySerializer(serializers.Serializer):
    """Serializer for setting inventory"""
    quantity = serializers.IntegerField(min_value=0)

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative")
        return value


class PurchaseCreateSerializer(serializers.Serializer):
    """Serializer for creating a purchase"""
    sku_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive")
        return value


class PurchaseResponseSerializer(serializers.ModelSerializer):
    """Serializer for purchase response"""
    sku = SKUListSerializer(read_only=True)
    user = serializers.IntegerField(source='user.id')

    class Meta:
        model = Purchase
        fields = ['id', 'user', 'sku', 'quantity', 'total_price', 'created_at']
