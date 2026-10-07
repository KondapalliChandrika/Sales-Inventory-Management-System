from app.models import Product


def test_adjustment_cannot_go_below_reserved(client, auth, db, customer, product):
    client.post("/api/v1/orders", headers=auth("sales"),
                json={"customer_id": customer.id, "items": [{"product_id": product.id, "quantity": 5}]})
    res = client.post("/api/v1/inventory/adjustments", headers=auth("manager"),
                      json={"product_id": product.id, "type": "ADJUSTMENT", "quantity": -6, "note": "Damaged"})
    assert res.status_code == 400


def test_stock_in_and_ledger(client, auth, db, product):
    res = client.post("/api/v1/inventory/adjustments", headers=auth("manager"),
                      json={"product_id": product.id, "type": "IN", "quantity": 15, "note": "PO-778 received"})
    assert res.status_code == 201
    assert res.json()["stock_on_hand"] == 25

    movements = client.get(f"/api/v1/inventory/movements?product_id={product.id}", headers=auth("sales")).json()
    assert movements["items"][0]["type"] == "IN"
    assert movements["items"][0]["stock_after"] == 25


def test_sales_cannot_adjust_stock(client, auth, product):
    res = client.post("/api/v1/inventory/adjustments", headers=auth("sales"),
                      json={"product_id": product.id, "type": "IN", "quantity": 1, "note": "test"})
    assert res.status_code == 403


def test_product_create_with_opening_stock(client, auth, db):
    res = client.post("/api/v1/products", headers=auth("manager"),
                      json={"sku": "new-1", "name": "New thing", "unit_price": "99.50", "opening_stock": 7})
    assert res.status_code == 201
    body = res.json()
    assert body["sku"] == "NEW-1" and body["stock_on_hand"] == 7 and body["unit_price"] == 99.5

    dup = client.post("/api/v1/products", headers=auth("manager"),
                      json={"sku": "NEW-1", "name": "Dup", "unit_price": "1"})
    assert dup.status_code == 409


def test_dashboard_summary_and_trend(client, auth, customer, product):
    client.post("/api/v1/orders", headers=auth("sales"),
                json={"customer_id": customer.id, "items": [{"product_id": product.id, "quantity": 2}]})
    client.post("/api/v1/orders", headers=auth("sales"),
                json={"customer_id": customer.id, "items": [{"product_id": product.id, "quantity": 5}]})

    summary = client.get("/api/v1/dashboard/summary", headers=auth("manager")).json()
    assert summary["sales_today"] == 23600.0
    assert summary["total_orders"] == 2
    assert summary["approvals"]["pending"] == 1
    assert len(summary["recent_orders"]) == 2

    trend = client.get("/api/v1/dashboard/sales-trend?days=7", headers=auth("manager")).json()
    assert len(trend) == 7
    assert trend[-1]["sales"] == 23600.0
