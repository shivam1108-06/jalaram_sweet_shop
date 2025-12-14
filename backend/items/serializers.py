from rest_framework import serializers
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for creating and displaying items"""

    inventory_unit = serializers.ReadOnlyField()

    class Meta:
        model = Item
        fields = ['id', 'name', 'category', 'sale_type', 'inventory_unit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'inventory_unit', 'is_active', 'created_at', 'updated_at']
