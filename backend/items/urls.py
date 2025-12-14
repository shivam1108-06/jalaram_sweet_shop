from django.urls import path
from .views import CreateItemView, ListItemsView

urlpatterns = [
    path('', CreateItemView.as_view(), name='create-item'),
    path('list', ListItemsView.as_view(), name='list-items'),
]
