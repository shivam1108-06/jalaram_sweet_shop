from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction
from accounts.views import IsAdminUser
from .serializers import ItemSerializer, SKUSerializer, ItemDetailSerializer, InventorySerializer, PurchaseCreateSerializer, PurchaseResponseSerializer
from .models import Item, SKU, Purchase


class CreateItemView(APIView):
    """Create item - admin only"""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListItemsView(APIView):
    """List all active items - public access"""

    permission_classes = [AllowAny]

    def get(self, request):
        items = Item.objects.filter(is_active=True)
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


class CreateSKUView(APIView):
    """Create SKU - admin only"""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = SKUSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemDetailView(APIView):
    """Get item details with SKUs - public access"""

    permission_classes = [AllowAny]

    def get(self, request, pk):
        item = get_object_or_404(Item, pk=pk, is_active=True)
        serializer = ItemDetailSerializer(item)
        return Response(serializer.data)


class SetInventoryView(APIView):
    """Set inventory quantity for an item - admin only"""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        item = get_object_or_404(Item, pk=pk)
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            item.inventory_qty = serializer.validated_data['quantity']
            item.save()
            return Response(ItemDetailSerializer(item).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PurchaseView(APIView):
    """Purchase a SKU - authenticated users only"""

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = PurchaseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        sku_id = serializer.validated_data['sku_id']
        quantity = serializer.validated_data['quantity']

        # Get SKU (must be active)
        sku = get_object_or_404(SKU, pk=sku_id, is_active=True)
        item = sku.item

        # Calculate total inventory needed
        total_needed = sku.unit_value * quantity

        # Check inventory
        if item.inventory_qty == 0:
            return Response(
                {'error': 'Item is out of stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if item.inventory_qty < total_needed:
            return Response(
                {'error': 'Insufficient inventory available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total price
        total_price = sku.price * quantity

        # Deduct inventory
        item.inventory_qty -= total_needed
        item.save()

        # Create purchase record
        purchase = Purchase.objects.create(
            user=request.user,
            sku=sku,
            quantity=quantity,
            total_price=total_price
        )

        return Response(
            PurchaseResponseSerializer(purchase).data,
            status=status.HTTP_201_CREATED
        )
