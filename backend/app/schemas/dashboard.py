from datetime import date

from pydantic import BaseModel

from app.models.enums import OrderStatus
from app.schemas.common import Money
from app.schemas.order import OrderListItem


class LowStockItem(BaseModel):
    id: int
    sku: str
    name: str
    available_qty: int
    reorder_level: int


class StatusCount(BaseModel):
    status: OrderStatus
    count: int


class ApprovalStats(BaseModel):
    pending: int
    approved_this_month: int
    rejected_this_month: int


class DashboardSummary(BaseModel):
    sales_today: Money
    sales_this_month: Money
    orders_this_month: int
    total_orders: int
    average_order_value: Money
    active_products: int
    active_customers: int
    inventory_value: Money
    low_stock_count: int
    approvals: ApprovalStats
    orders_by_status: list[StatusCount]
    recent_orders: list[OrderListItem]
    low_stock_items: list[LowStockItem]


class TrendPoint(BaseModel):
    date: date
    sales: Money
    orders: int
