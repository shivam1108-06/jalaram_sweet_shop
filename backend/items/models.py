from django.db import models


class Item(models.Model):
    """Sweet item model"""

    class Category(models.TextChoices):
        DRY = 'dry', 'Dry'
        MILK = 'milk', 'Milk'
        OTHER = 'other', 'Other'

    class SaleType(models.TextChoices):
        WEIGHT = 'weight', 'Weight'
        COUNT = 'count', 'Count'

    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    sale_type = models.CharField(max_length=20, choices=SaleType.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def inventory_unit(self):
        """Return the inventory unit based on sale type"""
        if self.sale_type == self.SaleType.WEIGHT:
            return 'grams'
        return 'pieces'

    def __str__(self):
        return self.name
