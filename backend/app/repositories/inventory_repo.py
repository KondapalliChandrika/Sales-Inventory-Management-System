from sqlalchemy import Select, select
from sqlalchemy.orm import joinedload

from app.models.inventory import InventoryMovement


def movements_query(product_id: int | None = None) -> Select:
    stmt = (
        select(InventoryMovement)
        .options(joinedload(InventoryMovement.product), joinedload(InventoryMovement.user))
        .order_by(InventoryMovement.created_at.desc(), InventoryMovement.id.desc())
    )
    if product_id:
        stmt = stmt.where(InventoryMovement.product_id == product_id)
    return stmt
