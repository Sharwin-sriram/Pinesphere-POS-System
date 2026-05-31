"""
Preservation Property Tests for Restaurant Admin Orders Visibility Bugfix

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

These tests verify that existing behavior is preserved after the fix:
- Staff users (with restaurant_id/branch_id) can place orders correctly
- Customers can view their own order history
- Order status updates work correctly
- Order retrieval by ID works correctly

IMPORTANT: These tests should PASS on UNFIXED code to establish baseline behavior.
"""

import pytest
from decimal import Decimal
from hypothesis import given, strategies as st, settings
from django.contrib.auth import get_user_model
from pinesphere.apps.orders import models, services
from authentication.models import Restaurant, Branch

User = get_user_model()


# ─── Test Data Generators ────────────────────────────────────────────────────


@st.composite
def staff_user_strategy(draw):
    """Generate a staff user with restaurant_id and branch_id set."""
    restaurant_id = draw(st.integers(min_value=1, max_value=1000))
    branch_id = draw(st.integers(min_value=1, max_value=1000))
    
    user = User(
        id=draw(st.integers(min_value=1, max_value=100000)),
        email=draw(st.emails()),
        mobile=draw(st.text(min_size=10, max_size=10, alphabet='0123456789')),
        first_name=draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll')))),
        last_name=draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll')))),
        role='waiter',
        restaurant_id=str(restaurant_id),
        branch_id=str(branch_id),
        is_active=True,
    )
    return user


@st.composite
def customer_user_strategy(draw):
    """Generate a customer user without restaurant_id and branch_id."""
    user = User(
        id=draw(st.integers(min_value=1, max_value=100000)),
        email=draw(st.emails()),
        mobile=draw(st.text(min_size=10, max_size=10, alphabet='0123456789')),
        first_name=draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll')))),
        last_name=draw(st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll')))),
        role='customer',
        restaurant_id=None,
        branch_id=None,
        is_active=True,
    )
    return user


@st.composite
def order_payload_strategy(draw, include_restaurant_ids=True):
    """Generate a valid order payload."""
    payload = {
        'items': [
            {
                'menu_item_id': str(draw(st.integers(min_value=1, max_value=1000))),
                'name': draw(st.text(min_size=3, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd', 'Zs')))),
                'quantity': draw(st.integers(min_value=1, max_value=10)),
                'unit_price': str(draw(st.decimals(min_value=1, max_value=1000, places=2))),
            }
            for _ in range(draw(st.integers(min_value=1, max_value=3)))
        ],
        'customer_id': str(draw(st.integers(min_value=1, max_value=100000))),
        'status': 'pending',
        'source': 'web',
        'delivery_type': 'pickup',
        'currency': 'INR',
    }
    
    if include_restaurant_ids:
        payload['restaurant_id'] = str(draw(st.integers(min_value=1, max_value=1000)))
        payload['branch_id'] = str(draw(st.integers(min_value=1, max_value=1000)))
    
    return payload


# ─── Preservation Property Tests ──────────────────────────────────────────────


@pytest.mark.django_db
class TestPreservationProperties:
    """
    Property 2: Preservation - Staff Order Placement Behavior
    
    These tests verify that existing behavior is preserved:
    - Staff users can place orders with their restaurant_id/branch_id
    - Customers can view their own orders
    """
    
    @given(
        staff_user=staff_user_strategy(),
        payload=order_payload_strategy(include_restaurant_ids=False)
    )
    @settings(max_examples=10, deadline=None)
    def test_staff_order_placement_preserves_user_attributes(self, staff_user, payload):
        """
        **Validates: Requirements 3.1**
        
        Property: For all staff users with restaurant_id and branch_id set,
        when they place an order WITHOUT restaurant_id/branch_id in the payload,
        the order is created with the user's restaurant_id and branch_id.
        
        This test observes and captures the CURRENT behavior on UNFIXED code.
        Expected: PASS on unfixed code (establishes baseline).
        """
        # Setup: Save the staff user to the database
        staff_user.set_password('testpass123')
        staff_user.save()
        
        # Ensure payload does NOT contain restaurant_id/branch_id
        # (staff users rely on their user attributes)
        payload.pop('restaurant_id', None)
        payload.pop('branch_id', None)
        
        # Act: Create order as staff user
        order = services.create_order(payload, user=staff_user)
        
        # Assert: Order should have staff user's restaurant_id and branch_id
        assert order.restaurant_id == staff_user.restaurant_id, \
            f"Expected order.restaurant_id={staff_user.restaurant_id}, got {order.restaurant_id}"
        assert order.branch_id == staff_user.branch_id, \
            f"Expected order.branch_id={staff_user.branch_id}, got {order.branch_id}"
        
        # Cleanup
        order.delete()
        staff_user.delete()
    
    @given(
        staff_user=staff_user_strategy(),
        payload=order_payload_strategy(include_restaurant_ids=True)
    )
    @settings(max_examples=10, deadline=None)
    def test_staff_order_placement_with_payload_ids(self, staff_user, payload):
        """
        **Validates: Requirements 3.1**
        
        Property: For all staff users with restaurant_id and branch_id set,
        when they place an order WITH restaurant_id/branch_id in the payload,
        the order is created with the payload values (not user attributes).
        
        This test observes the CURRENT behavior on UNFIXED code.
        Expected: PASS on unfixed code (establishes baseline).
        """
        # Setup: Save the staff user to the database
        staff_user.set_password('testpass123')
        staff_user.save()
        
        # Store the payload IDs for assertion
        expected_restaurant_id = payload['restaurant_id']
        expected_branch_id = payload['branch_id']
        
        # Act: Create order as staff user with explicit IDs in payload
        order = services.create_order(payload, user=staff_user)
        
        # Assert: Order should have payload's restaurant_id and branch_id
        # (payload takes precedence over user attributes)
        assert order.restaurant_id == expected_restaurant_id, \
            f"Expected order.restaurant_id={expected_restaurant_id}, got {order.restaurant_id}"
        assert order.branch_id == expected_branch_id, \
            f"Expected order.branch_id={expected_branch_id}, got {order.branch_id}"
        
        # Cleanup
        order.delete()
        staff_user.delete()
    
    @pytest.mark.django_db(transaction=True)
    @given(
        customer_user=customer_user_strategy(),
        payload=order_payload_strategy(include_restaurant_ids=True)
    )
    @settings(max_examples=10, deadline=None)
    def test_customer_can_retrieve_own_orders(self, customer_user, payload):
        """
        **Validates: Requirements 3.2**
        
        Property: For all customer users, they can retrieve their own orders
        by filtering on customer_id.
        
        This test verifies that customer order tracking continues to work.
        Expected: PASS on unfixed code (establishes baseline).
        """
        # Setup: Save the customer user to the database
        customer_user.set_password('testpass123')
        customer_user.save()
        
        # Set customer_id in payload to match the user
        payload['customer_id'] = str(customer_user.id)
        
        # Act: Create order as customer
        order = services.create_order(payload, user=customer_user)
        
        # Assert: Customer can retrieve their order by customer_id
        customer_orders = models.Order.objects.filter(
            customer_id=str(customer_user.id),
            deleted_at__isnull=True
        )
        
        assert customer_orders.exists(), \
            "Customer should be able to find their orders by customer_id"
        assert order.id in [o.id for o in customer_orders], \
            f"Order {order.id} should be in customer's order list"
        
        # Cleanup
        order.delete()
        customer_user.delete()
    
    @pytest.mark.django_db(transaction=True)
    @given(
        staff_user=staff_user_strategy(),
        payload=order_payload_strategy(include_restaurant_ids=False)
    )
    @settings(max_examples=10, deadline=None)
    def test_order_status_update_preservation(self, staff_user, payload):
        """
        **Validates: Requirements 3.3**
        
        Property: For all orders, status updates continue to work correctly
        after the fix.
        
        This test verifies that order status transitions are preserved.
        Expected: PASS on unfixed code (establishes baseline).
        """
        # Setup: Save the staff user and create an order
        staff_user.set_password('testpass123')
        staff_user.save()
        
        payload.pop('restaurant_id', None)
        payload.pop('branch_id', None)
        
        order = services.create_order(payload, user=staff_user)
        original_status = order.status
        
        # Act: Update order status
        new_status = 'preparing'
        updated_order = services.update_order_status(order, new_status, changed_by=staff_user)
        
        # Assert: Status update should work
        assert updated_order.status == new_status, \
            f"Expected status={new_status}, got {updated_order.status}"
        assert updated_order.status != original_status, \
            "Status should have changed from original"
        
        # Cleanup
        order.delete()
        staff_user.delete()
    
    @pytest.mark.django_db(transaction=True)
    @given(
        staff_user=staff_user_strategy(),
        payload=order_payload_strategy(include_restaurant_ids=False)
    )
    @settings(max_examples=10, deadline=None)
    def test_order_retrieval_by_id_preservation(self, staff_user, payload):
        """
        **Validates: Requirements 3.4**
        
        Property: For all orders, retrieval by order ID continues to work
        correctly after the fix.
        
        This test verifies that order retrieval is preserved.
        Expected: PASS on unfixed code (establishes baseline).
        """
        # Setup: Save the staff user and create an order
        staff_user.set_password('testpass123')
        staff_user.save()
        
        payload.pop('restaurant_id', None)
        payload.pop('branch_id', None)
        
        order = services.create_order(payload, user=staff_user)
        order_id = order.id
        
        # Act: Retrieve order by ID
        retrieved_order = models.Order.objects.get(id=order_id)
        
        # Assert: Should retrieve the correct order
        assert retrieved_order.id == order_id, \
            f"Expected order.id={order_id}, got {retrieved_order.id}"
        assert retrieved_order.restaurant_id == order.restaurant_id, \
            "Retrieved order should have same restaurant_id"
        assert retrieved_order.branch_id == order.branch_id, \
            "Retrieved order should have same branch_id"
        
        # Cleanup
        order.delete()
        staff_user.delete()


# ─── Unit Tests for Specific Preservation Cases ──────────────────────────────


@pytest.mark.django_db
class TestPreservationUnitTests:
    """
    Unit tests for specific preservation scenarios.
    
    These complement the property-based tests with concrete examples.
    """
    
    def test_staff_user_order_creation_without_payload_ids(self):
        """
        **Validates: Requirements 3.1**
        
        Concrete example: Staff user places order without restaurant_id/branch_id
        in payload. Order should use user's attributes.
        
        Expected: PASS on unfixed code.
        """
        # Setup: Create a staff user with restaurant_id and branch_id
        staff_user = User.objects.create_user(
            email='staff@test.com',
            mobile='1234567890',
            password='testpass123',
            first_name='Staff',
            last_name='User',
            role='waiter',
            restaurant_id='100',
            branch_id='200',
        )
        
        # Create order payload without restaurant_id/branch_id
        payload = {
            'items': [
                {
                    'menu_item_id': '1',
                    'name': 'Test Item',
                    'quantity': 2,
                    'unit_price': '10.00',
                }
            ],
            'customer_id': '999',
            'status': 'pending',
            'source': 'web',
            'delivery_type': 'pickup',
        }
        
        # Act: Create order
        order = services.create_order(payload, user=staff_user)
        
        # Assert: Order should have staff user's restaurant_id and branch_id
        assert order.restaurant_id == '100'
        assert order.branch_id == '200'
        
        # Cleanup
        order.delete()
        staff_user.delete()
    
    def test_customer_order_tracking_by_customer_id(self):
        """
        **Validates: Requirements 3.2**
        
        Concrete example: Customer places order and can retrieve it by customer_id.
        
        Expected: PASS on unfixed code.
        """
        # Setup: Create a customer user
        customer_user = User.objects.create_user(
            email='customer@test.com',
            mobile='9876543210',
            password='testpass123',
            first_name='Customer',
            last_name='User',
            role='customer',
            restaurant_id=None,
            branch_id=None,
        )
        
        # Create order payload with restaurant_id/branch_id
        payload = {
            'items': [
                {
                    'menu_item_id': '1',
                    'name': 'Test Item',
                    'quantity': 1,
                    'unit_price': '15.00',
                }
            ],
            'customer_id': str(customer_user.id),
            'restaurant_id': '100',
            'branch_id': '200',
            'status': 'pending',
            'source': 'web',
            'delivery_type': 'delivery',
        }
        
        # Act: Create order
        order = services.create_order(payload, user=customer_user)
        
        # Assert: Customer can retrieve their order by customer_id
        customer_orders = models.Order.objects.filter(
            customer_id=str(customer_user.id),
            deleted_at__isnull=True
        )
        
        assert customer_orders.exists()
        assert order.id in [o.id for o in customer_orders]
        
        # Cleanup
        order.delete()
        customer_user.delete()
