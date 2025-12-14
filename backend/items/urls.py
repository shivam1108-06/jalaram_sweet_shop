from django.urls import path
from .views import CreateItemView, ListItemsView, CreateSKUView, ItemDetailView, SetInventoryView, PurchaseView

urlpatterns = [
    path('', CreateItemView.as_view(), name='create-item'),
    path('list', ListItemsView.as_view(), name='list-items'),
    path('skus', CreateSKUView.as_view(), name='create-sku'),
    path('purchase', PurchaseView.as_view(), name='purchase'),
    path('<int:pk>', ItemDetailView.as_view(), name='item-detail'),
    path('<int:pk>/inventory', SetInventoryView.as_view(), name='set-inventory'),
]
