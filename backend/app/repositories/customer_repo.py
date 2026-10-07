from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.customer import Customer


def get(db: Session, customer_id: int) -> Customer | None:
    return db.get(Customer, customer_id)


def list_query(search: str | None = None, active: bool | None = None) -> Select:
    stmt = select(Customer).order_by(Customer.name)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(Customer.name.ilike(like) | Customer.email.ilike(like) | Customer.phone.ilike(like))
    if active is not None:
        stmt = stmt.where(Customer.is_active.is_(active))
    return stmt
