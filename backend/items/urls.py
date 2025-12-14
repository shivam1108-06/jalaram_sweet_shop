from django.urls import path
from .views import CreateItemView

urlpatterns = [
    path('', CreateItemView.as_view(), name='create-item'),
]
