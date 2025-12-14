from django.urls import path
from .views import CreateItemView, ListItemsView, CreateSKUView

urlpatterns = [
    path('', CreateItemView.as_view(), name='create-item'),
    path('list', ListItemsView.as_view(), name='list-items'),
    path('skus', CreateSKUView.as_view(), name='create-sku'),
]
