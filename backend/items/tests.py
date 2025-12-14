import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Create an admin user"""
    from accounts.models import User
    user = User.objects.create_user(
        username='admin@test.com',
        email='admin@test.com',
        name='Admin User',
        password='AdminPass123!',
        role='admin'
    )
    return user


@pytest.fixture
def admin_client(api_client, admin_user):
    """API client authenticated as admin"""
    url = reverse('login')
    response = api_client.post(url, {
        'email': admin_user.email,
        'password': 'AdminPass123!'
    }, format='json')
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return api_client


@pytest.fixture
def customer_user(db):
    """Create a customer user"""
    from accounts.models import User
    user = User.objects.create_user(
        username='customer@test.com',
        email='customer@test.com',
        name='Customer User',
        password='CustomerPass123!',
        role='customer'
    )
    return user


@pytest.fixture
def customer_client(api_client, customer_user):
    """API client authenticated as customer"""
    url = reverse('login')
    response = api_client.post(url, {
        'email': customer_user.email,
        'password': 'CustomerPass123!'
    }, format='json')
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return api_client


@pytest.mark.django_db
class TestCreateItem:
    """Tests for admin creating items - US-2.1"""

    def test_admin_can_create_item_with_weight_sale_type(self, admin_client):
        """Admin can create an item sold by weight"""
        url = reverse('create-item')
        data = {
            'name': 'Kaju Katli',
            'category': 'dry',
            'sale_type': 'weight'
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Kaju Katli'
        assert response.data['category'] == 'dry'
        assert response.data['sale_type'] == 'weight'
        assert response.data['inventory_unit'] == 'grams'
        assert response.data['is_active'] == True

    def test_admin_can_create_item_with_count_sale_type(self, admin_client):
        """Admin can create an item sold by count"""
        url = reverse('create-item')
        data = {
            'name': 'Gulab Jamun',
            'category': 'milk',
            'sale_type': 'count'
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Gulab Jamun'
        assert response.data['category'] == 'milk'
        assert response.data['sale_type'] == 'count'
        assert response.data['inventory_unit'] == 'pieces'

    def test_item_name_must_be_unique(self, admin_client):
        """Cannot create two items with the same name"""
        url = reverse('create-item')
        data = {
            'name': 'Rasgulla',
            'category': 'milk',
            'sale_type': 'count'
        }

        # Create first item
        admin_client.post(url, data, format='json')

        # Try to create duplicate
        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_category_must_be_valid(self, admin_client):
        """Category must be one of: dry, milk, other"""
        url = reverse('create-item')
        data = {
            'name': 'Test Sweet',
            'category': 'invalid_category',
            'sale_type': 'weight'
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_sale_type_must_be_valid(self, admin_client):
        """Sale type must be one of: weight, count"""
        url = reverse('create-item')
        data = {
            'name': 'Test Sweet',
            'category': 'dry',
            'sale_type': 'invalid_type'
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_customer_cannot_create_item(self, customer_client):
        """Customers are forbidden from creating items"""
        url = reverse('create-item')
        data = {
            'name': 'Test Sweet',
            'category': 'dry',
            'sale_type': 'weight'
        }

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_item(self, api_client):
        """Unauthenticated users cannot create items"""
        url = reverse('create-item')
        data = {
            'name': 'Test Sweet',
            'category': 'dry',
            'sale_type': 'weight'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
