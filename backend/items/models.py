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
    inventory_qty = models.PositiveIntegerField(default=0)  # grams for weight, pieces for count
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


class SKU(models.Model):
    """Stock Keeping Unit - pricing and quantity options for items"""

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='skus')
    code = models.CharField(max_length=50, unique=True)
    unit_value = models.PositiveIntegerField()  # grams for weight, pieces for count
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'SKU'
        verbose_name_plural = 'SKUs'

    @property
    def display_unit(self):
        """Return human-readable unit display"""
        if self.item.sale_type == Item.SaleType.WEIGHT:
            if self.unit_value >= 1000:
                return f"{self.unit_value / 1000:.1f}kg"
            return f"{self.unit_value}g"
        return f"{self.unit_value}pc" if self.unit_value == 1 else f"{self.unit_value}pcs"

    def __str__(self):
        return f"{self.item.name} - {self.code}"
