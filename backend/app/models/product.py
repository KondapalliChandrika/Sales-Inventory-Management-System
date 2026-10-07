from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("stock_on_hand >= 0", name="ck_products_stock_non_negative"),
        CheckConstraint("reserved_qty >= 0", name="ck_products_reserved_non_negative"),
        CheckConstraint("reserved_qty <= stock_on_hand", name="ck_products_reserved_le_stock"),
        CheckConstraint("unit_price > 0", name="ck_products_price_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(150), index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    description: Mapped[str | None] = mapped_column(Text)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    stock_on_hand: Mapped[int] = mapped_column(default=0)
    reserved_qty: Mapped[int] = mapped_column(default=0)
    reorder_level: Mapped[int] = mapped_column(default=10)
    is_active: Mapped[bool] = mapped_column(default=True)

    category: Mapped[Category | None] = relationship(lazy="joined")

    @property
    def available_qty(self) -> int:
        return self.stock_on_hand - self.reserved_qty

    @property
    def is_low_stock(self) -> bool:
        return self.available_qty <= self.reorder_level
