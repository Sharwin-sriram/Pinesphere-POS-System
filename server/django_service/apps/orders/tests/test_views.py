import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_orders_list_requires_auth():
    client = APIClient()
    response = client.get("/api/v1/orders/")
    assert response.status_code in {401, 403}

