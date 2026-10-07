from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, InsufficientStockError, NotFoundError
from app.models.enums import MovementType
from app.models.inventory import InventoryMovement
from app.models.product import Product
from app.models.user import User
from app.repositories import product_repo
from app.schemas.inventory import StockAdjustmentCreate

ORDER_REF = "SALES_ORDER"


def _record(
    db: Session,
    product: Product,
    movement_type: MovementType,
    quantity: int,
    user: User,
    *,
    reference_id: int | None = None,
    reference_type: str | None = ORDER_REF,
    note: str | None = None,
) -> None:
    db.add(
        InventoryMovement(
            product_id=product.id,
            type=movement_type,
            quantity=quantity,
            stock_after=product.stock_on_hand,
            reserved_after=product.reserved_qty,
            reference_type=reference_type if reference_id else None,
            reference_id=reference_id,
            note=note,
            created_by=user.id,
        )
    )


def ensure_available(product: Product, quantity: int) -> None:
    if product.available_qty < quantity:
        raise InsufficientStockError(
            f"Only {product.available_qty} unit(s) of {product.sku} available, {quantity} requested",
            details={"product_id": product.id, "sku": product.sku,
                     "available": product.available_qty, "requested": quantity},
        )


def reserve(db: Session, product: Product, quantity: int, user: User, order_id: int) -> None:
    ensure_available(product, quantity)
    product.reserved_qty += quantity
    _record(db, product, MovementType.RESERVE, quantity, user, reference_id=order_id)


def release(db: Session, product: Product, quantity: int, user: User, order_id: int) -> None:
    product.reserved_qty = max(product.reserved_qty - quantity, 0)
    _record(db, product, MovementType.RELEASE, -quantity, user, reference_id=order_id)


def consume_reservation(db: Session, product: Product, quantity: int, user: User, order_id: int) -> None:
    if product.reserved_qty < quantity or product.stock_on_hand < quantity:
        raise InsufficientStockError(
            f"Reserved stock for {product.sku} is no longer available",
            details={"product_id": product.id, "sku": product.sku},
        )
    product.reserved_qty -= quantity
    product.stock_on_hand -= quantity
    _record(db, product, MovementType.OUT, -quantity, user, reference_id=order_id)


def deduct(db: Session, product: Product, quantity: int, user: User, order_id: int) -> None:
    ensure_available(product, quantity)
    product.stock_on_hand -= quantity
    _record(db, product, MovementType.OUT, -quantity, user, reference_id=order_id)


def add_opening_stock(db: Session, product: Product, quantity: int, user: User) -> None:
    product.stock_on_hand += quantity
    _record(db, product, MovementType.IN, quantity, user, reference_type=None, note="Opening stock")


def adjust(db: Session, data: StockAdjustmentCreate, user: User) -> Product:
    locked = product_repo.lock_many(db, [data.product_id])
    product = locked.get(data.product_id)
    if product is None:
        raise NotFoundError("Product not found")

    new_stock = product.stock_on_hand + data.quantity
    if new_stock < 0:
        raise BusinessRuleError(f"Stock cannot go below zero (current: {product.stock_on_hand})")
    if new_stock < product.reserved_qty:
        raise BusinessRuleError(
            f"{product.reserved_qty} unit(s) are reserved for pending orders; stock cannot go below that"
        )

    product.stock_on_hand = new_stock
    _record(db, product, MovementType(data.type), data.quantity, user, reference_type=None, note=data.note)
    db.commit()
    return product
