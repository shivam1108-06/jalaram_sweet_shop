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


@pytest.fixture
def sample_items(db):
    """Create sample items for testing"""
    from items.models import Item
    items = [
        Item.objects.create(name='Kaju Katli', category='dry', sale_type='weight'),
        Item.objects.create(name='Gulab Jamun', category='milk', sale_type='count'),
        Item.objects.create(name='Soan Papdi', category='dry', sale_type='weight'),
        Item.objects.create(name='Inactive Sweet', category='other', sale_type='weight', is_active=False),
    ]
    return items


@pytest.mark.django_db
class TestListItems:
    """Tests for viewing all items - US-2.2"""

    def test_authenticated_user_can_list_items(self, customer_client, sample_items):
        """Any authenticated user can view the items list"""
        url = reverse('list-items')

        response = customer_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3  # Only active items
        names = [item['name'] for item in response.data]
        assert 'Kaju Katli' in names
        assert 'Gulab Jamun' in names
        assert 'Soan Papdi' in names
        assert 'Inactive Sweet' not in names

    def test_list_items_returns_item_details(self, customer_client, sample_items):
        """Items list includes name, category, sale_type, inventory_unit"""
        url = reverse('list-items')

        response = customer_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        item = next(i for i in response.data if i['name'] == 'Kaju Katli')
        assert item['category'] == 'dry'
        assert item['sale_type'] == 'weight'
        assert item['inventory_unit'] == 'grams'

    def test_admin_can_list_items(self, admin_client, sample_items):
        """Admin can also view the items list"""
        url = reverse('list-items')

        response = admin_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3

    def test_unauthenticated_can_list_items(self, api_client, sample_items):
        """Unauthenticated users can view items (public browsing)"""
        url = reverse('list-items')

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3


@pytest.fixture
def weight_item(db):
    """Create a weight-based item"""
    from items.models import Item
    return Item.objects.create(name='Kaju Katli', category='dry', sale_type='weight')


@pytest.fixture
def count_item(db):
    """Create a count-based item"""
    from items.models import Item
    return Item.objects.create(name='Gulab Jamun', category='milk', sale_type='count')


@pytest.mark.django_db
class TestCreateSKU:
    """Tests for admin creating SKUs - US-3.1"""

    def test_admin_can_create_sku_for_weight_item(self, admin_client, weight_item):
        """Admin can create SKU for weight-based item"""
        url = reverse('create-sku')
        data = {
            'item': weight_item.id,
            'code': 'KK-250',
            'unit_value': 250,
            'price': 450.00
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['code'] == 'KK-250'
        assert response.data['unit_value'] == 250
        assert float(response.data['price']) == 450.00
        assert response.data['item'] == weight_item.id
        assert response.data['is_active'] == True

    def test_admin_can_create_sku_for_count_item(self, admin_client, count_item):
        """Admin can create SKU for count-based item"""
        url = reverse('create-sku')
        data = {
            'item': count_item.id,
            'code': 'GJ-6',
            'unit_value': 6,
            'price': 120.00
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['code'] == 'GJ-6'
        assert response.data['unit_value'] == 6
        assert float(response.data['price']) == 120.00

    def test_sku_code_must_be_unique(self, admin_client, weight_item):
        """Cannot create two SKUs with the same code"""
        url = reverse('create-sku')
        data = {
            'item': weight_item.id,
            'code': 'KK-250',
            'unit_value': 250,
            'price': 450.00
        }

        # Create first SKU
        admin_client.post(url, data, format='json')

        # Try to create duplicate
        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_sku_requires_valid_item(self, admin_client):
        """SKU must reference a valid item"""
        url = reverse('create-sku')
        data = {
            'item': 99999,
            'code': 'INVALID',
            'unit_value': 250,
            'price': 450.00
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_sku_price_must_be_positive(self, admin_client, weight_item):
        """SKU price must be positive"""
        url = reverse('create-sku')
        data = {
            'item': weight_item.id,
            'code': 'KK-250',
            'unit_value': 250,
            'price': -50.00
        }

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_customer_cannot_create_sku(self, customer_client, weight_item):
        """Customers are forbidden from creating SKUs"""
        url = reverse('create-sku')
        data = {
            'item': weight_item.id,
            'code': 'KK-250',
            'unit_value': 250,
            'price': 450.00
        }

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_sku(self, api_client, weight_item):
        """Unauthenticated users cannot create SKUs"""
        url = reverse('create-sku')
        data = {
            'item': weight_item.id,
            'code': 'KK-250',
            'unit_value': 250,
            'price': 450.00
        }

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.fixture
def item_with_skus(db):
    """Create an item with multiple SKUs"""
    from items.models import Item, SKU
    item = Item.objects.create(name='Kaju Katli', category='dry', sale_type='weight')
    SKU.objects.create(item=item, code='KK-250', unit_value=250, price=450.00)
    SKU.objects.create(item=item, code='KK-500', unit_value=500, price=900.00)
    SKU.objects.create(item=item, code='KK-1000', unit_value=1000, price=1800.00)
    # Inactive SKU - should not appear
    SKU.objects.create(item=item, code='KK-OLD', unit_value=100, price=180.00, is_active=False)
    return item


@pytest.mark.django_db
class TestItemDetail:
    """Tests for viewing item details with SKUs - US-3.2"""

    def test_can_view_item_detail(self, api_client, item_with_skus):
        """Anyone can view item details"""
        url = reverse('item-detail', kwargs={'pk': item_with_skus.id})

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Kaju Katli'
        assert response.data['category'] == 'dry'
        assert response.data['sale_type'] == 'weight'
        assert response.data['inventory_unit'] == 'grams'

    def test_item_detail_includes_active_skus(self, api_client, item_with_skus):
        """Item detail includes list of active SKUs"""
        url = reverse('item-detail', kwargs={'pk': item_with_skus.id})

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'skus' in response.data
        assert len(response.data['skus']) == 3  # Only active SKUs

    def test_skus_include_required_fields(self, api_client, item_with_skus):
        """Each SKU includes code, unit_value, price, display_unit"""
        url = reverse('item-detail', kwargs={'pk': item_with_skus.id})

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        sku = response.data['skus'][0]
        assert 'code' in sku
        assert 'unit_value' in sku
        assert 'price' in sku
        assert 'display_unit' in sku

    def test_item_detail_returns_404_for_nonexistent(self, api_client):
        """Returns 404 for non-existent item"""
        url = reverse('item-detail', kwargs={'pk': 99999})

        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_item_detail_returns_404_for_inactive_item(self, api_client, db):
        """Returns 404 for inactive item"""
        from items.models import Item
        inactive_item = Item.objects.create(
            name='Inactive Sweet', category='dry', sale_type='weight', is_active=False
        )
        url = reverse('item-detail', kwargs={'pk': inactive_item.id})

        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestInventory:
    """Tests for inventory management - US-4.1"""

    def test_admin_can_set_inventory(self, admin_client, weight_item):
        """Admin can set inventory quantity for an item"""
        url = reverse('set-inventory', kwargs={'pk': weight_item.id})
        data = {'quantity': 5000}  # 5000 grams

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['inventory_qty'] == 5000

    def test_inventory_returned_in_item_detail(self, api_client, weight_item):
        """Item detail includes inventory quantity"""
        from items.models import Item
        Item.objects.filter(pk=weight_item.id).update(inventory_qty=5000)
        url = reverse('item-detail', kwargs={'pk': weight_item.id})

        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['inventory_qty'] == 5000

    def test_customer_cannot_set_inventory(self, customer_client, weight_item):
        """Customers are forbidden from setting inventory"""
        url = reverse('set-inventory', kwargs={'pk': weight_item.id})
        data = {'quantity': 5000}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_set_inventory(self, api_client, weight_item):
        """Unauthenticated users cannot set inventory"""
        url = reverse('set-inventory', kwargs={'pk': weight_item.id})
        data = {'quantity': 5000}

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_inventory_cannot_be_negative(self, admin_client, weight_item):
        """Inventory quantity cannot be negative"""
        url = reverse('set-inventory', kwargs={'pk': weight_item.id})
        data = {'quantity': -100}

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_set_inventory_returns_404_for_nonexistent_item(self, admin_client):
        """Setting inventory for non-existent item returns 404"""
        url = reverse('set-inventory', kwargs={'pk': 99999})
        data = {'quantity': 5000}

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.fixture
def item_with_inventory_and_skus(db):
    """Create an item with inventory and SKUs for purchase testing"""
    from items.models import Item, SKU
    item = Item.objects.create(
        name='Kaju Katli',
        category='dry',
        sale_type='weight',
        inventory_qty=5000  # 5000 grams in stock
    )
    SKU.objects.create(item=item, code='KK-250', unit_value=250, price=450.00)
    SKU.objects.create(item=item, code='KK-500', unit_value=500, price=900.00)
    SKU.objects.create(item=item, code='KK-1000', unit_value=1000, price=1800.00)
    return item


@pytest.fixture
def count_item_with_inventory(db):
    """Create a count-based item with inventory"""
    from items.models import Item, SKU
    item = Item.objects.create(
        name='Gulab Jamun',
        category='milk',
        sale_type='count',
        inventory_qty=50  # 50 pieces in stock
    )
    SKU.objects.create(item=item, code='GJ-1', unit_value=1, price=25.00)
    SKU.objects.create(item=item, code='GJ-6', unit_value=6, price=140.00)
    return item


@pytest.mark.django_db
class TestPurchase:
    """Tests for purchase flow - US-5.1, US-5.2, US-5.3"""

    def test_customer_can_purchase_sku(self, customer_client, item_with_inventory_and_skus):
        """Customer can purchase a SKU when inventory is sufficient"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 1}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['sku']['code'] == 'KK-250'
        assert response.data['quantity'] == 1
        assert 'total_price' in response.data

    def test_purchase_deducts_inventory(self, customer_client, item_with_inventory_and_skus):
        """Purchase deducts SKU unit_value from item inventory - US-5.3"""
        from items.models import SKU, Item
        sku = SKU.objects.get(code='KK-500')  # 500 grams
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 2}  # Buy 2x 500g = 1000g

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        item = Item.objects.get(pk=item_with_inventory_and_skus.id)
        assert item.inventory_qty == 4000  # 5000 - 1000 = 4000

    def test_purchase_fails_when_out_of_stock(self, customer_client, item_with_inventory_and_skus):
        """Purchase fails when inventory is insufficient - US-5.2"""
        from items.models import SKU, Item
        Item.objects.filter(pk=item_with_inventory_and_skus.id).update(inventory_qty=0)
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 1}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'out of stock' in response.data['error'].lower()

    def test_purchase_fails_when_insufficient_inventory(self, customer_client, item_with_inventory_and_skus):
        """Purchase fails when requested quantity exceeds inventory"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-1000')  # 1000 grams
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 10}  # 10 x 1000g = 10000g, but only 5000g available

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'insufficient' in response.data['error'].lower()

    def test_purchase_returns_total_price(self, customer_client, item_with_inventory_and_skus):
        """Purchase response includes calculated total price"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 3}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert float(response.data['total_price']) == 1350.00

    def test_purchase_count_item_deducts_pieces(self, customer_client, count_item_with_inventory):
        """Purchase of count item deducts pieces from inventory"""
        from items.models import SKU, Item
        sku = SKU.objects.get(code='GJ-6')  # 6 pieces
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 2}  # Buy 2x 6pcs = 12 pieces

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        item = Item.objects.get(pk=count_item_with_inventory.id)
        assert item.inventory_qty == 38  # 50 - 12 = 38

    def test_admin_can_purchase(self, admin_client, item_with_inventory_and_skus):
        """Admin can also make purchases"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 1}

        response = admin_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED

    def test_unauthenticated_cannot_purchase(self, api_client, item_with_inventory_and_skus):
        """Unauthenticated users cannot make purchases"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 1}

        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_purchase_requires_valid_sku(self, customer_client):
        """Purchase fails with invalid SKU ID"""
        url = reverse('purchase')
        data = {'sku_id': 99999, 'quantity': 1}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_purchase_requires_positive_quantity(self, customer_client, item_with_inventory_and_skus):
        """Purchase fails with zero or negative quantity"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 0}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_purchase_linked_to_user(self, customer_client, customer_user, item_with_inventory_and_skus):
        """Purchase is associated with the authenticated user"""
        from items.models import SKU
        sku = SKU.objects.get(code='KK-250')
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 1}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user'] == customer_user.id

    def test_cannot_purchase_inactive_sku(self, customer_client, item_with_inventory_and_skus):
        """Cannot purchase an inactive SKU"""
        from items.models import SKU
        sku = SKU.objects.create(
            item=item_with_inventory_and_skus,
            code='KK-OLD',
            unit_value=100,
            price=180.00,
            is_active=False
        )
        url = reverse('purchase')
        data = {'sku_id': sku.id, 'quantity': 1}

        response = customer_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND
