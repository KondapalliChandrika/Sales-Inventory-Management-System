from datetime import date, datetime, time, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.enums import ApprovalAction, OrderStatus
from app.models.order import OrderApproval, SalesOrder
from app.models.mixins import utcnow
from app.models.product import Product
from app.schemas.dashboard import ApprovalStats, DashboardSummary, LowStockItem, StatusCount, TrendPoint
from app.schemas.order import OrderListItem

ZERO = Decimal("0")


def _sales_since(db: Session, start: datetime) -> Decimal:
    stmt = select(func.coalesce(func.sum(SalesOrder.total), 0)).where(
        SalesOrder.status == OrderStatus.COMPLETED, SalesOrder.completed_at >= start
    )
    return Decimal(db.scalar(stmt) or 0)


def _count(db: Session, stmt) -> int:
    return db.scalar(stmt) or 0


def get_summary(db: Session) -> DashboardSummary:
    now = utcnow()
    today_start = datetime.combine(now.date(), time.min)
    month_start = datetime.combine(now.date().replace(day=1), time.min)

    completed_count, completed_total = db.execute(
        select(func.count(SalesOrder.id), func.coalesce(func.sum(SalesOrder.total), 0)).where(
            SalesOrder.status == OrderStatus.COMPLETED
        )
    ).one()

    status_rows = db.execute(select(SalesOrder.status, func.count(SalesOrder.id)).group_by(SalesOrder.status)).all()
    counts = {status: n for status, n in status_rows}

    def approvals_this_month(action: ApprovalAction) -> int:
        return _count(db, select(func.count(OrderApproval.id)).where(
            OrderApproval.action == action, OrderApproval.created_at >= month_start))

    available = Product.stock_on_hand - Product.reserved_qty
    low_stock_filter = (Product.is_active.is_(True), available <= Product.reorder_level)
    low_stock_products = db.scalars(
        select(Product).where(*low_stock_filter).order_by(available.asc()).limit(5)
    ).unique().all()

    recent = db.scalars(
        select(SalesOrder)
        .options(joinedload(SalesOrder.customer), joinedload(SalesOrder.creator))
        .order_by(SalesOrder.created_at.desc(), SalesOrder.id.desc())
        .limit(6)
    ).unique().all()

    return DashboardSummary(
        sales_today=_sales_since(db, today_start),
        sales_this_month=_sales_since(db, month_start),
        orders_this_month=_count(db, select(func.count(SalesOrder.id)).where(SalesOrder.created_at >= month_start)),
        total_orders=sum(counts.values()),
        average_order_value=(Decimal(completed_total) / completed_count).quantize(Decimal("0.01"))
        if completed_count else ZERO,
        active_products=_count(db, select(func.count(Product.id)).where(Product.is_active.is_(True))),
        active_customers=_count(db, select(func.count(Customer.id)).where(Customer.is_active.is_(True))),
        inventory_value=Decimal(db.scalar(
            select(func.coalesce(func.sum(Product.stock_on_hand * Product.unit_price), 0))
            .where(Product.is_active.is_(True))) or 0),
        low_stock_count=_count(db, select(func.count(Product.id)).where(*low_stock_filter)),
        approvals=ApprovalStats(
            pending=counts.get(OrderStatus.PENDING_APPROVAL, 0),
            approved_this_month=approvals_this_month(ApprovalAction.APPROVED),
            rejected_this_month=approvals_this_month(ApprovalAction.REJECTED),
        ),
        orders_by_status=[StatusCount(status=s, count=counts.get(s, 0)) for s in OrderStatus],
        recent_orders=[OrderListItem.model_validate(o) for o in recent],
        low_stock_items=[
            LowStockItem(id=p.id, sku=p.sku, name=p.name, available_qty=p.available_qty, reorder_level=p.reorder_level)
            for p in low_stock_products
        ],
    )


def get_sales_trend(db: Session, days: int) -> list[TrendPoint]:
    end = utcnow().date()
    start = end - timedelta(days=days - 1)
    day = func.date(SalesOrder.completed_at)
    rows = db.execute(
        select(day, func.coalesce(func.sum(SalesOrder.total), 0), func.count(SalesOrder.id))
        .where(SalesOrder.status == OrderStatus.COMPLETED,
               SalesOrder.completed_at >= datetime.combine(start, time.min))
        .group_by(day)
    ).all()
    by_day = {(d if isinstance(d, date) else date.fromisoformat(str(d))): (Decimal(s), n) for d, s, n in rows}

    points = []
    for offset in range(days):
        current = start + timedelta(days=offset)
        sales, orders = by_day.get(current, (ZERO, 0))
        points.append(TrendPoint(date=current, sales=sales, orders=orders))
    return points
