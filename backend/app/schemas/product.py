from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import Money, ORMModel, UTCDateTime


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)


class CategoryOut(ORMModel):
    id: int
    name: str


class ProductCreate(BaseModel):
    sku: str = Field(min_length=2, max_length=50, pattern=r"^[A-Za-z0-9\-_]+$")
    name: str = Field(min_length=2, max_length=150)
    category_id: int | None = None
    description: str | None = Field(default=None, max_length=1000)
    unit_price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    reorder_level: int = Field(default=10, ge=0)
    opening_stock: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    category_id: int | None = None
    description: str | None = Field(default=None, max_length=1000)
    unit_price: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    reorder_level: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductOut(ORMModel):
    id: int
    sku: str
    name: str
    category: CategoryOut | None
    description: str | None
    unit_price: Money
    stock_on_hand: int
    reserved_qty: int
    available_qty: int
    reorder_level: int
    is_low_stock: bool
    is_active: bool
    created_at: UTCDateTime


class ProductBrief(ORMModel):
    id: int
    sku: str
    name: str
