from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.product import Category, Product


def get(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_by_sku(db: Session, sku: str) -> Product | None:
    return db.scalar(select(Product).where(Product.sku == sku))


def lock_many(db: Session, product_ids: list[int]) -> dict[int, Product]:
    stmt = (
        select(Product)
        .where(Product.id.in_(sorted(set(product_ids))))
        .order_by(Product.id)
        .with_for_update(of=Product)
    )
    return {p.id: p for p in db.scalars(stmt).unique()}


def list_query(
    search: str | None = None,
    active: bool | None = None,
    category_id: int | None = None,
    low_stock: bool = False,
) -> Select:
    stmt = select(Product).order_by(Product.name)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(Product.name.ilike(like) | Product.sku.ilike(like))
    if active is not None:
        stmt = stmt.where(Product.is_active.is_(active))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if low_stock:
        stmt = stmt.where(Product.stock_on_hand - Product.reserved_qty <= Product.reorder_level)
    return stmt


def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


def get_category_by_name(db: Session, name: str) -> Category | None:
    return db.scalar(select(Category).where(Category.name == name))
