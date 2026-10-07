from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.models.enums import MovementType
from app.schemas.common import ORMModel, UTCDateTime
from app.schemas.product import ProductBrief
from app.schemas.user import UserBrief


class StockAdjustmentCreate(BaseModel):
    product_id: int
    type: Literal["IN", "ADJUSTMENT"]
    quantity: int = Field(description="Positive to add stock. ADJUSTMENT may be negative.")
    note: str = Field(min_length=3, max_length=255)

    @model_validator(mode="after")
    def check_quantity(self):
        if self.quantity == 0:
            raise ValueError("Quantity cannot be zero")
        if self.type == "IN" and self.quantity < 0:
            raise ValueError("Stock IN quantity must be positive")
        return self


class MovementOut(ORMModel):
    id: int
    product: ProductBrief
    type: MovementType
    quantity: int
    stock_after: int
    reserved_after: int
    reference_type: str | None
    reference_id: int | None
    note: str | None
    user: UserBrief
    created_at: UTCDateTime
