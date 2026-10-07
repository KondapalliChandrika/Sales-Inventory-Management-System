from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models
from app.core.config import settings
from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models import Customer, Product, User
from app.models.enums import UserRole
from app.services import email_service


@pytest.fixture()
def session_factory(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    monkeypatch.setattr(email_service, "SessionLocal", factory)
    monkeypatch.setattr(settings, "EMAIL_ENABLED", False)
    monkeypatch.setattr(settings, "AUTO_MIGRATE", False)
    monkeypatch.setattr(settings, "AUTO_SEED", False)
    yield factory
    engine.dispose()


@pytest.fixture()
def db(session_factory):
    with session_factory() as session:
        yield session


@pytest.fixture()
def client(session_factory):
    def override_get_db():
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def users(db):
    created = {}
    for key, role in (("admin", UserRole.ADMIN), ("manager", UserRole.MANAGER),
                      ("manager2", UserRole.MANAGER), ("sales", UserRole.SALES), ("sales2", UserRole.SALES)):
        user = User(name=key.title(), email=f"{key}@test.com", password_hash=hash_password("Password@1"), role=role)
        db.add(user)
        created[key] = user
    db.commit()
    return created


@pytest.fixture()
def auth(users):
    def _headers(key: str) -> dict[str, str]:
        user = users[key]
        return {"Authorization": f"Bearer {create_access_token(user.id, user.role.value)}"}

    return _headers


@pytest.fixture()
def customer(db, users):
    c = Customer(name="Acme", email="acme@test.com", created_by=users["admin"].id)
    db.add(c)
    db.commit()
    return c


@pytest.fixture()
def product(db):
    p = Product(sku="SKU-1", name="Widget", unit_price=Decimal("10000.00"), stock_on_hand=10, reserved_qty=0)
    db.add(p)
    db.commit()
    return p
