def test_login_success(client, users):
    res = client.post("/api/v1/auth/login", json={"email": "sales@test.com", "password": "Password@1"})
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"]
    assert body["user"]["role"] == "SALES"


def test_login_wrong_password_returns_error_shape(client, users):
    res = client.post("/api/v1/auth/login", json={"email": "sales@test.com", "password": "nope"})
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_me_requires_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "UNAUTHORIZED"


def test_sales_cannot_manage_users(client, auth):
    res = client.get("/api/v1/users", headers=auth("sales"))
    assert res.status_code == 403
