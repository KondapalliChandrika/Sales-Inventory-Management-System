from sqlalchemy import select

from app.models import EmailLog, InventoryMovement, Product
from app.models.enums import EmailStatus, MovementType


def create_order(client, headers, customer, product, qty):
    return client.post(
        "/api/v1/orders",
        json={"customer_id": customer.id, "items": [{"product_id": product.id, "quantity": qty}]},
        headers=headers,
    )


def fresh(db, product) -> Product:
    db.expire_all()
    return db.get(Product, product.id)


def test_small_order_completes_and_deducts_stock(client, auth, db, customer, product):
    res = create_order(client, auth("sales"), customer, product, 2)
    assert res.status_code == 201
    order = res.json()
    assert order["status"] == "COMPLETED"
    assert order["requires_approval"] is False
    assert order["subtotal"] == 20000.0 and order["tax"] == 3600.0 and order["total"] == 23600.0
    assert order["order_number"].startswith("SO-")

    p = fresh(db, product)
    assert (p.stock_on_hand, p.reserved_qty) == (8, 0)
    movement = db.scalar(select(InventoryMovement).where(InventoryMovement.product_id == p.id))
    assert movement.type == MovementType.OUT and movement.quantity == -2


def test_large_order_needs_approval_reserves_stock_and_emails_managers(client, auth, db, customer, product):
    res = create_order(client, auth("sales"), customer, product, 5)
    assert res.status_code == 201
    order = res.json()
    assert order["status"] == "PENDING_APPROVAL"
    assert [a["action"] for a in order["approvals"]] == ["REQUESTED"]

    p = fresh(db, product)
    assert (p.stock_on_hand, p.reserved_qty, p.available_qty) == (10, 5, 5)

    emails = db.scalars(select(EmailLog)).all()
    assert {e.to_email for e in emails} == {"manager@test.com", "manager2@test.com"}
    assert all(e.status == EmailStatus.SKIPPED for e in emails)


def test_insufficient_stock_is_rejected_and_nothing_changes(client, auth, db, customer, product):
    res = create_order(client, auth("sales"), customer, product, 11)
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "INSUFFICIENT_STOCK"
    p = fresh(db, product)
    assert (p.stock_on_hand, p.reserved_qty) == (10, 0)


def test_reserved_stock_is_not_available_to_other_orders(client, auth, customer, product):
    assert create_order(client, auth("sales"), customer, product, 5).json()["status"] == "PENDING_APPROVAL"
    res = create_order(client, auth("sales2"), customer, product, 6)
    assert res.status_code == 409


def test_duplicate_lines_are_merged(client, auth, customer, product):
    res = client.post(
        "/api/v1/orders",
        json={"customer_id": customer.id, "items": [{"product_id": product.id, "quantity": 1},
                                                    {"product_id": product.id, "quantity": 1}]},
        headers=auth("sales"),
    )
    assert res.status_code == 201
    items = res.json()["items"]
    assert len(items) == 1 and items[0]["quantity"] == 2


def test_approve_consumes_reservation_and_notifies_creator(client, auth, db, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 5).json()["id"]

    res = client.post(f"/api/v1/orders/{order_id}/approve", json={"comment": "OK"}, headers=auth("manager"))
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "COMPLETED" and body["completed_at"]
    assert [a["action"] for a in body["approvals"]] == ["REQUESTED", "APPROVED"]

    p = fresh(db, product)
    assert (p.stock_on_hand, p.reserved_qty) == (5, 0)
    assert db.scalar(select(EmailLog).where(EmailLog.template == "order_approved.html")).to_email == "sales@test.com"


def test_reject_releases_reservation(client, auth, db, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 5).json()["id"]

    res = client.post(f"/api/v1/orders/{order_id}/reject", json={"reason": "Budget exceeded"},
                      headers=auth("manager"))
    assert res.status_code == 200
    assert res.json()["status"] == "REJECTED"

    p = fresh(db, product)
    assert (p.stock_on_hand, p.reserved_qty) == (10, 0)
    assert db.scalar(select(EmailLog).where(EmailLog.template == "order_rejected.html")) is not None


def test_reject_requires_reason(client, auth, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 5).json()["id"]
    res = client.post(f"/api/v1/orders/{order_id}/reject", json={"reason": ""}, headers=auth("manager"))
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "VALIDATION_ERROR"


def test_order_cannot_be_approved_twice(client, auth, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 5).json()["id"]
    assert client.post(f"/api/v1/orders/{order_id}/approve", json={}, headers=auth("manager")).status_code == 200
    res = client.post(f"/api/v1/orders/{order_id}/approve", json={}, headers=auth("manager2"))
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "ORDER_ALREADY_PROCESSED"


def test_manager_cannot_approve_own_order(client, auth, customer, product):
    order_id = create_order(client, auth("manager"), customer, product, 5).json()["id"]
    res = client.post(f"/api/v1/orders/{order_id}/approve", json={}, headers=auth("manager"))
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "SELF_APPROVAL"


def test_sales_user_cannot_approve(client, auth, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 5).json()["id"]
    res = client.post(f"/api/v1/orders/{order_id}/approve", json={}, headers=auth("sales2"))
    assert res.status_code == 403


def test_creator_can_cancel_pending_order(client, auth, db, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 5).json()["id"]
    assert client.post(f"/api/v1/orders/{order_id}/cancel", headers=auth("sales2")).status_code == 403

    res = client.post(f"/api/v1/orders/{order_id}/cancel", headers=auth("sales"))
    assert res.status_code == 200 and res.json()["status"] == "CANCELLED"
    assert fresh(db, product).reserved_qty == 0


def test_sales_users_only_see_their_own_orders(client, auth, customer, product):
    order_id = create_order(client, auth("sales"), customer, product, 1).json()["id"]
    assert client.get(f"/api/v1/orders/{order_id}", headers=auth("sales2")).status_code == 403
    assert client.get("/api/v1/orders", headers=auth("sales2")).json()["total"] == 0
    assert client.get("/api/v1/orders", headers=auth("manager")).json()["total"] == 1


def test_empty_order_is_a_validation_error(client, auth, customer):
    res = client.post("/api/v1/orders", json={"customer_id": customer.id, "items": []}, headers=auth("sales"))
    assert res.status_code == 422
    assert res.json()["error"]["details"][0]["field"] == "items"


def test_threshold_is_configurable(client, auth, customer, product):
    res = client.put("/api/v1/settings", json={"approval_threshold": 100000}, headers=auth("admin"))
    assert res.status_code == 200
    assert create_order(client, auth("sales"), customer, product, 5).json()["status"] == "COMPLETED"
