from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.product import Category, Product
from app.models.user import User
from app.repositories import product_repo
from app.schemas.product import CategoryCreate, ProductCreate, ProductUpdate
from app.services import inventory_service


def get_or_404(db: Session, product_id: int) -> Product:
    product = product_repo.get(db, product_id)
    if product is None:
        raise NotFoundError("Product not found")
    return product


def _ensure_category(db: Session, category_id: int | None) -> None:
    if category_id is not None and db.get(Category, category_id) is None:
        raise NotFoundError("Category not found")


def create(db: Session, data: ProductCreate, user: User) -> Product:
    sku = data.sku.upper()
    if product_repo.get_by_sku(db, sku):
        raise ConflictError(f"SKU {sku} already exists", code="SKU_TAKEN")
    _ensure_category(db, data.category_id)

    product = Product(**data.model_dump(exclude={"opening_stock", "sku"}), sku=sku, stock_on_hand=0, reserved_qty=0)
    db.add(product)
    db.flush()
    if data.opening_stock:
        inventory_service.add_opening_stock(db, product, data.opening_stock, user)
    db.commit()
    return product


def update(db: Session, product_id: int, data: ProductUpdate) -> Product:
    product = get_or_404(db, product_id)
    changes = data.model_dump(exclude_unset=True)
    if "category_id" in changes:
        _ensure_category(db, changes["category_id"])
    for field, value in changes.items():
        setattr(product, field, value)
    db.commit()
    return product


def deactivate(db: Session, product_id: int) -> None:
    product = get_or_404(db, product_id)
    product.is_active = False
    db.commit()


def create_category(db: Session, data: CategoryCreate) -> Category:
    if product_repo.get_category_by_name(db, data.name):
        raise ConflictError("Category already exists")
    category = Category(name=data.name)
    db.add(category)
    db.commit()
    return category
