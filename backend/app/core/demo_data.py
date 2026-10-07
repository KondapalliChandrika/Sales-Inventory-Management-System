import logging
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import AppSetting, Category, Customer, Product, User
from app.models.enums import UserRole
from app.services import inventory_service
from app.services.settings_service import APPROVAL_THRESHOLD, TAX_RATE_PERCENT

logger = logging.getLogger(__name__)

USERS = [
    ("Admin User", "admin@example.com", "Admin@123", UserRole.ADMIN),
    ("Maya Manager", "manager@example.com", "Manager@123", UserRole.MANAGER),
    ("Sam Sales", "sales@example.com", "Sales@123", UserRole.SALES),
]

CATEGORIES = ["Electronics", "Furniture", "Stationery"]

PRODUCTS = [
    ("ELEC-LAP-001", "Laptop 14\" i5 / 16GB", "Electronics", "58000.00", 25, 5),
    ("ELEC-MON-002", "Monitor 24\" IPS", "Electronics", "12500.00", 40, 8),
    ("ELEC-KBD-003", "Wireless Keyboard", "Electronics", "1800.00", 120, 20),
    ("ELEC-MOU-004", "Wireless Mouse", "Electronics", "900.00", 8, 15),
    ("FURN-CHR-001", "Ergonomic Office Chair", "Furniture", "9500.00", 30, 5),
    ("FURN-DSK-002", "Standing Desk", "Furniture", "24000.00", 12, 3),
    ("STAT-PEN-001", "Gel Pen (Box of 10)", "Stationery", "150.00", 500, 100),
    ("STAT-NTB-002", "A4 Notebook 200 pages", "Stationery", "120.00", 60, 80),
]

CUSTOMERS = [
    ("Acme Corporation", "purchase@acme.example", "+91 98450 11111", "MG Road, Bengaluru"),
    ("Globex Pvt Ltd", "orders@globex.example", "+91 98450 22222", "Hitech City, Hyderabad"),
    ("Initech Solutions", "it@initech.example", "+91 98450 33333", "Baner, Pune"),
    ("Umbrella Retail", "buy@umbrella.example", "+91 98450 44444", "Andheri, Mumbai"),
]


def _get_or_create_user(db: Session, name: str, email: str, password: str, role: UserRole) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(name=name, email=email, password_hash=hash_password(password), role=role)
        db.add(user)
        db.flush()
        logger.info("Demo user created: %s / %s (%s)", email, password, role.value)
    return user


def seed_demo_data(db: Session) -> None:
    users = [_get_or_create_user(db, *u) for u in USERS]
    admin = users[0]

    for key, value in ((APPROVAL_THRESHOLD, settings.DEFAULT_APPROVAL_THRESHOLD),
                       (TAX_RATE_PERCENT, settings.DEFAULT_TAX_RATE_PERCENT)):
        if db.get(AppSetting, key) is None:
            db.add(AppSetting(key=key, value=str(value), updated_by=admin.id))

    categories = {}
    for name in CATEGORIES:
        category = db.scalar(select(Category).where(Category.name == name))
        if category is None:
            category = Category(name=name)
            db.add(category)
            db.flush()
        categories[name] = category

    added_products = 0
    for sku, name, cat, price, stock, reorder in PRODUCTS:
        if db.scalar(select(Product).where(Product.sku == sku)):
            continue
        product = Product(sku=sku, name=name, category_id=categories[cat].id, unit_price=Decimal(price),
                          stock_on_hand=0, reserved_qty=0, reorder_level=reorder)
        db.add(product)
        db.flush()
        inventory_service.add_opening_stock(db, product, stock, admin)
        added_products += 1

    added_customers = 0
    for name, email, phone, address in CUSTOMERS:
        if db.scalar(select(Customer).where(Customer.name == name)) is None:
            db.add(Customer(name=name, email=email, phone=phone, address=address, created_by=admin.id))
            added_customers += 1

    db.commit()
    logger.info("Demo data ready (%d products, %d customers added)", added_products, added_customers)


def seed_if_empty(session_factory: sessionmaker = SessionLocal) -> None:
    with session_factory() as db:
        if db.scalar(select(func.count(User.id))):
            logger.info("Demo data: users already exist — skipping")
            return
        logger.info("Demo data: database is empty — adding demo users, products and customers")
        seed_demo_data(db)
