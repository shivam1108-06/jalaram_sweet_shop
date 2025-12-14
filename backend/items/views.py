from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from accounts.views import IsAdminUser
from .serializers import ItemSerializer, SKUSerializer, ItemDetailSerializer
from .models import Item


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
