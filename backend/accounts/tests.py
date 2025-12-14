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
class TestCreateCashier:
    """Tests for admin creating cashier accounts - US-1.3"""

    def test_admin_can_create_cashier(self, admin_client):
        """Admin can create a cashier account"""
        url = reverse('create-cashier')
        data = {
            'name': 'New Cashier',
            'email': 'cashier@example.com',
            'password': 'CashierPass123!'
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['email'] == 'cashier@example.com'
        assert response.data['name'] == 'New Cashier'
        assert response.data['role'] == 'cashier'
        assert 'password' not in response.data

    def test_customer_cannot_create_cashier(self, customer_client):
        """Customers are forbidden from creating cashier accounts"""
        url = reverse('create-cashier')
        data = {
            'name': 'New Cashier',
            'email': 'cashier@example.com',
            'password': 'CashierPass123!'
        }

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_cashier(self, api_client):
        """Unauthenticated users cannot create cashier accounts"""
        url = reverse('create-cashier')
        data = {
            'name': 'New Cashier',
            'email': 'cashier@example.com',
            'password': 'CashierPass123!'
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
