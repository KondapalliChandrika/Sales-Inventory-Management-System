from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import MovementType
from app.models.mixins import utcnow
from app.models.product import Product
from app.models.user import User


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    __table_args__ = (Index("ix_inventory_movements_product_created", "product_id", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    type: Mapped[MovementType] = mapped_column(SAEnum(MovementType, name="movement_type"))
    quantity: Mapped[int]
    stock_after: Mapped[int]
    reserved_after: Mapped[int]
    reference_type: Mapped[str | None] = mapped_column(String(30))
    reference_id: Mapped[int | None]
    note: Mapped[str | None] = mapped_column(String(255))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    product: Mapped[Product] = relationship()
    user: Mapped[User] = relationship()
