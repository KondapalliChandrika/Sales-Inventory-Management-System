import pytest


@pytest.mark.parametrize(
    "phone, stored",
    [("9845011111", "+91 9845011111"), ("+91 98450 11111", "+91 9845011111"), ("+91-98450-11111", "+91 9845011111")],
)
def test_valid_phone_numbers_are_normalised(client, auth, phone, stored):
    res = client.post("/api/v1/customers", json={"name": "Valid Co", "phone": phone}, headers=auth("sales"))
    assert res.status_code == 201
    assert res.json()["phone"] == stored


@pytest.mark.parametrize("phone", ["9845011111123", "98450", "+1 9845011111", "98450abcde"])
def test_invalid_phone_numbers_are_rejected(client, auth, phone):
    res = client.post("/api/v1/customers", json={"name": "Bad Co", "phone": phone}, headers=auth("sales"))
    assert res.status_code == 422
    assert "10-digit" in res.json()["error"]["message"]


def test_manager_can_reactivate_customer(client, auth, customer):
    assert client.delete(f"/api/v1/customers/{customer.id}", headers=auth("manager")).status_code == 204
    res = client.patch(f"/api/v1/customers/{customer.id}", json={"is_active": True}, headers=auth("manager"))
    assert res.status_code == 200 and res.json()["is_active"] is True


def test_sales_cannot_change_customer_active_status(client, auth, customer):
    res = client.patch(f"/api/v1/customers/{customer.id}", json={"is_active": False}, headers=auth("sales"))
    assert res.status_code == 403
    assert client.patch(f"/api/v1/customers/{customer.id}", json={"name": "Acme Ltd"}, headers=auth("sales")).status_code == 200


def test_admin_can_delete_user_without_activity(client, auth, users):
    res = client.delete(f"/api/v1/users/{users['sales2'].id}", headers=auth("admin"))
    assert res.status_code == 204
    emails = [u["email"] for u in client.get("/api/v1/users", headers=auth("admin")).json()["items"]]
    assert "sales2@test.com" not in emails


def test_user_with_orders_cannot_be_deleted(client, auth, users, customer, product):
    client.post("/api/v1/orders", headers=auth("sales"),
                json={"customer_id": customer.id, "items": [{"product_id": product.id, "quantity": 1}]})
    res = client.delete(f"/api/v1/users/{users['sales'].id}", headers=auth("admin"))
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "USER_HAS_ACTIVITY"


def test_admin_cannot_delete_self_and_others_cannot_delete(client, auth, users):
    assert client.delete(f"/api/v1/users/{users['admin'].id}", headers=auth("admin")).status_code == 400
    assert client.delete(f"/api/v1/users/{users['sales2'].id}", headers=auth("manager")).status_code == 403
