from datetime import date, datetime, time

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.customer import Customer
from app.models.enums import OrderStatus
from app.models.order import OrderApproval, SalesOrder, SalesOrderItem

_DETAIL_OPTIONS = (
    joinedload(SalesOrder.customer),
    joinedload(SalesOrder.creator),
    selectinload(SalesOrder.items).joinedload(SalesOrderItem.product),
    selectinload(SalesOrder.approvals).joinedload(OrderApproval.actor),
)


def get_detail(db: Session, order_id: int) -> SalesOrder | None:
    stmt = select(SalesOrder).where(SalesOrder.id == order_id).options(*_DETAIL_OPTIONS)
    return db.scalars(stmt).unique().one_or_none()


def get_for_update(db: Session, order_id: int) -> SalesOrder | None:
    stmt = select(SalesOrder).where(SalesOrder.id == order_id).with_for_update()
    return db.scalar(stmt)


def list_query(
    *,
    status: OrderStatus | None = None,
    customer_id: int | None = None,
    created_by: int | None = None,
    search: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> Select:
    stmt = (
        select(SalesOrder)
        .options(joinedload(SalesOrder.customer), joinedload(SalesOrder.creator))
        .order_by(SalesOrder.created_at.desc(), SalesOrder.id.desc())
    )
    if status:
        stmt = stmt.where(SalesOrder.status == status)
    if customer_id:
        stmt = stmt.where(SalesOrder.customer_id == customer_id)
    if created_by:
        stmt = stmt.where(SalesOrder.created_by == created_by)
    if search:
        like = f"%{search}%"
        stmt = stmt.join(SalesOrder.customer).where(
            SalesOrder.order_number.ilike(like) | Customer.name.ilike(like)
        )
    if date_from:
        stmt = stmt.where(SalesOrder.created_at >= datetime.combine(date_from, time.min))
    if date_to:
        stmt = stmt.where(SalesOrder.created_at <= datetime.combine(date_to, time.max))
    return stmt
