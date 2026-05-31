"""
Bug Condition Exploration Test for Restaurant Admin Orders Visibility

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

This test is EXPECTED TO FAIL on unfixed code - failure confirms the bug exists.
DO NOT attempt to fix the test or the code when it fails.

The test encodes the expected behavior - it will validate the fix when it passes after implementation.
"""

import pytest
from hypothesis import given, strategies as st, settings, HealthCheck
from rest_framework.test import APIClient
from authentication.models import User, Restaurant, Branch


# Strategy for generating customer users (without restaurant_id/branch_id)
@st.composite
def customer_user_strategy(draw):
    """Generate a customer user without restaurant_id or branch_id attributes."""
    mobile = draw(st.text(min_size=10, max_size=15, alphabet=st.characters(whitelist_categories=('Nd',))))
    first_name = draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll'))))
    last_name = draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll'))))
    
    return {
        'mobile': mobile,
        'first_name': first_name,
        'last_name': last_name,
        'role': User.RoleChoices.CUSTOMER,
        'restaurant_id': None,  # Customer users don't have restaurant_id
        'branch_id': None,  # Customer users don't have branch_id
    }


# Strategy for generating restaurant-admin users (with restaurant_id/branch_id)
@st.composite
def restaurant_admin_user_strategy(draw, restaurant_id, branch_id):
    """Generate a restaurant-admin user with restaurant_id and branch_id attributes."""
    mobile = draw(st.text(min_size=10, max_size=15, alphabet=st.characters(whitelist_categories=('Nd',))))
    first_name = draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll'))))
    last_name = draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll'))))
    
    return {
        'mobile': mobile,
        'first_name': first_name,
        'last_name': last_name,
        'role': User.RoleChoices.ORGANIZATION_OWNER,
        'restaurant_id': restaurant_id,
        'branch_id': branch_id,
    }


# Strategy for generating order payloads with restaurant_id
@st.composite
def order_payload_strategy(draw, restaurant_id, branch_id):
    """Generate an order payload with restaurant_id and branch_id."""
    customer_name = draw(st.text(min_size=1, max_size=100, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Zs'))))
    customer_phone = draw(st.text(min_size=10, max_size=15, alphabet=st.characters(whitelist_categories=('Nd',))))
    
    # Generate at least one item
    num_items = draw(st.integers(min_value=1, max_value=5))
    items = []
    for _ in range(num_items):
        item_name = draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Zs'))))
        qty = draw(st.integers(min_value=1, max_value=10))
        unit_price = draw(st.decimals(min_value=1, max_value=1000, places=2))
        items.append({
            'item_name': item_name,
            'qty': qty,
            'unit_price': float(unit_price),
        })
    
    return {
        'restaurant': str(restaurant_id),
        'branch': str(branch_id),
        'customer_name': customer_name,
        'customer_phone': customer_phone,
        'order_type': 'delivery',
        'items': items,
    }


@pytest.mark.django_db
class TestBugConditionExploration:
    """
    Property 1: Bug Condition - Customer Orders Have Correct Restaurant Association
    
    **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    
    CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
    
    Test that when a customer user (without restaurant_id/branch_id attributes) places an order
    with restaurant_id and branch_id in the payload, the created order has those values stored
    in the database.
    
    Expected Behavior Properties from design:
    - order.restaurant_id equals payload.restaurant_id
    - order.branch_id equals payload.branch_id (stored in notes for now)
    - restaurant-admin can see the order in their orders list
    """
    
    @given(
        customer_data=customer_user_strategy(),
        seed=st.integers(min_value=1, max_value=1000000)
    )
    @settings(
        max_examples=10,
        deadline=None,
        suppress_health_check=[HealthCheck.function_scoped_fixture, HealthCheck.too_slow]
    )
    def test_customer_order_has_correct_restaurant_association(self, customer_data, seed):
        """
        Property: For any customer user placing an order with restaurant_id in payload,
        the created order SHALL have that restaurant_id stored in the database.
        
        EXPECTED OUTCOME: Test FAILS (this is correct - it proves the bug exists)
        
        Counterexamples: orders created with null restaurant_id despite payload containing valid values
        """
        # Setup: Create a restaurant and branch
        restaurant = Restaurant.objects.create(
            name=f"Test Restaurant {seed}",
            address="123 Test St",
            phone="1234567890",
            email=f"test{seed}@restaurant.com"
        )
        branch = Branch.objects.create(
            restaurant=restaurant,
            name=f"Main Branch {seed}",
            address="123 Test St",
            phone="1234567890"
        )
        
        # Create customer user (without restaurant_id/branch_id)
        customer = User.objects.create_user(**customer_data)
        assert customer.restaurant_id is None, "Customer should not have restaurant_id"
        assert customer.branch_id is None, "Customer should not have branch_id"
        
        # Create restaurant-admin user (with restaurant_id/branch_id)
        admin_data = {
            'mobile': f"9999{seed}",
            'first_name': 'Admin',
            'last_name': 'User',
            'role': User.RoleChoices.ORGANIZATION_OWNER,
            'restaurant_id': str(restaurant.id),
            'branch_id': str(branch.id),
        }
        admin_user = User.objects.create_user(**admin_data)
        
        # Generate order payload with restaurant_id and branch_id
        order_payload = {
            'restaurant_id': str(restaurant.id),
            'branch_id': str(branch.id),
            'customer_id': str(customer.id),
            'delivery_type': 'delivery',
            'items': [
                {
                    'name': 'Test Item',
                    'quantity': 1,
                    'unit_price': 10.00,
                }
            ],
        }
        
        # Act: Customer places order with restaurant_id in payload
        client = APIClient()
        client.force_authenticate(user=customer)
        response = client.post('/api/v1/orders/', order_payload, format='json')
        
        # Assert: Order creation succeeds
        assert response.status_code == 201, f"Order creation failed: {response.data}"
        order_data = response.data['data']
        order_id = order_data['id']
        
        # CRITICAL ASSERTIONS - These will FAIL on unfixed code
        # Expected Behavior Property 1: order.restaurant_id equals payload.restaurant_id
        assert order_data['restaurant_id'] == str(restaurant.id), (
            f"COUNTEREXAMPLE FOUND: Order created with restaurant_id={order_data['restaurant_id']} "
            f"but payload had restaurant_id={restaurant.id}. "
            f"This confirms the bug exists - customer orders are not associated with the correct restaurant."
        )
        
        # Verify in database
        from apps.orders.models import Order
        order = Order.objects.get(id=order_id)
        assert order.restaurant_id == str(restaurant.id), (
            f"COUNTEREXAMPLE FOUND: Order in database has restaurant_id={order.restaurant_id} "
            f"but payload had restaurant_id={restaurant.id}. "
            f"This confirms the bug - restaurant_id is not being stored correctly."
        )
        
        # Expected Behavior Property 2: restaurant-admin can see the order in their orders list
        admin_client = APIClient()
        admin_client.force_authenticate(user=admin_user)
        admin_response = admin_client.get('/api/v1/orders/')
        
        assert admin_response.status_code == 200, "Admin should be able to list orders"
        admin_orders = admin_response.data['data']
        order_ids = [o['id'] for o in admin_orders]
        
        assert order_id in order_ids, (
            f"COUNTEREXAMPLE FOUND: Order {order_id} is not visible to restaurant-admin user. "
            f"Admin sees {len(admin_orders)} orders: {order_ids}. "
            f"This confirms the bug - customer-placed orders are invisible to restaurant-admin."
        )
    
    @pytest.mark.django_db
    def test_customer_order_visibility_to_restaurant_admin_concrete_example(self):
        """
        Concrete example test: Customer places order, restaurant-admin should see it.
        
        This is a simpler, concrete version of the property test above.
        
        EXPECTED OUTCOME: Test FAILS (this is correct - it proves the bug exists)
        """
        # Setup: Create a restaurant and branch
        restaurant = Restaurant.objects.create(
            name="Pizza Palace",
            address="123 Pizza St",
            phone="1234567890",
            email="info@pizzapalace.com"
        )
        branch = Branch.objects.create(
            restaurant=restaurant,
            name="Main Branch",
            address="123 Pizza St",
            phone="1234567890"
        )
        
        # Create customer user (without restaurant_id/branch_id)
        customer = User.objects.create_user(
            mobile="1234567890",
            first_name="John",
            last_name="Customer",
            role=User.RoleChoices.CUSTOMER,
            restaurant_id=None,
            branch_id=None,
        )
        
        # Create restaurant-admin user (with restaurant_id/branch_id)
        admin_user = User.objects.create_user(
            mobile="9876543210",
            first_name="Admin",
            last_name="User",
            role=User.RoleChoices.ORGANIZATION_OWNER,
            restaurant_id=str(restaurant.id),
            branch_id=str(branch.id),
        )
        
        # Customer places order with restaurant_id in payload
        client = APIClient()
        client.force_authenticate(user=customer)
        
        order_payload = {
            'restaurant_id': str(restaurant.id),
            'branch_id': str(branch.id),
            'customer_id': str(customer.id),
            'delivery_type': 'delivery',
            'items': [
                {
                    'name': 'Margherita Pizza',
                    'quantity': 2,
                    'unit_price': 12.99,
                }
            ],
        }
        
        response = client.post('/api/v1/orders/', order_payload, format='json')
        assert response.status_code == 201, f"Order creation failed: {response.data}"
        
        order_data = response.data['data']
        order_id = order_data['id']
        
        # CRITICAL ASSERTION 1: Order should have correct restaurant_id
        print(f"\n=== BUG CONDITION EXPLORATION ===")
        print(f"Order created: {order_id}")
        print(f"Expected restaurant_id: {restaurant.id}")
        print(f"Actual restaurant_id: {order_data['restaurant_id']}")
        
        assert order_data['restaurant_id'] == str(restaurant.id), (
            f"BUG CONFIRMED: Order has restaurant_id={order_data['restaurant_id']} "
            f"instead of {restaurant.id}"
        )
        
        # CRITICAL ASSERTION 2: Restaurant-admin should see the order
        admin_client = APIClient()
        admin_client.force_authenticate(user=admin_user)
        admin_response = admin_client.get('/api/v1/orders/')
        
        assert admin_response.status_code == 200
        admin_orders = admin_response.data['data']
        order_ids = [o['id'] for o in admin_orders]
        
        print(f"Restaurant-admin sees {len(admin_orders)} orders: {order_ids}")
        print(f"Looking for order: {order_id}")
        
        assert order_id in order_ids, (
            f"BUG CONFIRMED: Order {order_id} is not visible to restaurant-admin. "
            f"This proves customer-placed orders are invisible to restaurant staff."
        )
