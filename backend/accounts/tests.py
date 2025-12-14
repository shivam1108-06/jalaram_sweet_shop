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


@pytest.fixture
def create_user(api_client):
    """Helper fixture to create a user"""
    def _create_user(email='test@example.com', password='SecurePass123!', name='Test User'):
        url = reverse('register')
        api_client.post(url, {
            'name': name,
            'email': email,
            'password': password
        }, format='json')
        return {'email': email, 'password': password, 'name': name}
    return _create_user


@pytest.mark.django_db
class TestUserLogin:
    """Tests for user login endpoint"""

    def test_user_can_login_with_valid_credentials(self, api_client, create_user):
        """User can login and receive JWT tokens"""
        user_data = create_user()
        url = reverse('login')

        response = api_client.post(url, {
            'email': user_data['email'],
            'password': user_data['password']
        }, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_fails_with_wrong_password(self, api_client, create_user):
        """Login fails with incorrect password"""
        user_data = create_user()
        url = reverse('login')

        response = api_client.post(url, {
            'email': user_data['email'],
            'password': 'WrongPassword123!'
        }, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_fails_with_nonexistent_email(self, api_client):
        """Login fails if email doesn't exist"""
        url = reverse('login')

        response = api_client.post(url, {
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123!'
        }, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_fails_with_missing_fields(self, api_client):
        """Login fails if required fields are missing"""
        url = reverse('login')

        response = api_client.post(url, {
            'email': 'test@example.com'
        }, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
