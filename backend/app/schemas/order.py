from pydantic import BaseModel, Field

from app.models.enums import ApprovalAction, OrderStatus
from app.schemas.common import Money, ORMModel, UTCDateTime
from app.schemas.customer import CustomerBrief
from app.schemas.product import ProductBrief
from app.schemas.user import UserBrief


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=100_000)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemIn] = Field(min_length=1, max_length=100)
    notes: str | None = Field(default=None, max_length=1000)


class ApproveRequest(BaseModel):
    comment: str | None = Field(default=None, max_length=500)


class RejectRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


class OrderItemOut(ORMModel):
    id: int
    product: ProductBrief
    quantity: int
    unit_price: Money
    line_total: Money


class ApprovalOut(ORMModel):
    id: int
    action: ApprovalAction
    actor: UserBrief
    comment: str | None
    created_at: UTCDateTime


class OrderListItem(ORMModel):
    id: int
    order_number: str
    customer: CustomerBrief
    creator: UserBrief
    status: OrderStatus
    total: Money
    requires_approval: bool
    created_at: UTCDateTime


class OrderOut(OrderListItem):
    subtotal: Money
    tax_rate: Money
    tax: Money
    notes: str | None
    completed_at: UTCDateTime | None
    items: list[OrderItemOut]
    approvals: list[ApprovalOut]
