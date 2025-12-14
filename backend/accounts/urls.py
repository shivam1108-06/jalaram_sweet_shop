from django.urls import path
from .views import RegisterView, LoginView, CreateCashierView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('cashiers', CreateCashierView.as_view(), name='create-cashier'),
]
