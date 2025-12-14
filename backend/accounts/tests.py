import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestCustomerRegistration:
    """Tests for customer registration endpoint"""

    def test_customer_can_register_with_valid_data(self, api_client):
        """Customer can register with name, email, and password"""
        url = reverse('register')
        data = {
            'name': 'Test Customer',
            'email': 'customer@example.com',
            'password': 'SecurePass123!'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['email'] == 'customer@example.com'
        assert response.data['name'] == 'Test Customer'
        assert response.data['role'] == 'customer'
        assert 'password' not in response.data

    def test_registration_fails_with_duplicate_email(self, api_client):
        """Registration fails if email already exists"""
        url = reverse('register')
        data = {
            'name': 'First Customer',
            'email': 'duplicate@example.com',
            'password': 'SecurePass123!'
        }

        # First registration
        api_client.post(url, data, format='json')

        # Second registration with same email
        data['name'] = 'Second Customer'
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_registration_fails_with_weak_password(self, api_client):
        """Registration fails if password is too weak"""
        url = reverse('register')
        data = {
            'name': 'Test Customer',
            'email': 'customer@example.com',
            'password': '123'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_registration_fails_with_missing_fields(self, api_client):
        """Registration fails if required fields are missing"""
        url = reverse('register')
        data = {
            'email': 'customer@example.com'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
