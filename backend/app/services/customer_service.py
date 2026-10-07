from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.enums import UserRole
from app.models.customer import Customer
from app.models.user import User
from app.repositories import customer_repo
from app.schemas.customer import CustomerCreate, CustomerUpdate


def get_or_404(db: Session, customer_id: int) -> Customer:
    customer = customer_repo.get(db, customer_id)
    if customer is None:
        raise NotFoundError("Customer not found")
    return customer


def create(db: Session, data: CustomerCreate, user: User) -> Customer:
    customer = Customer(**data.model_dump(), created_by=user.id)
    db.add(customer)
    db.commit()
    return customer


def update(db: Session, customer_id: int, data: CustomerUpdate, user: User) -> Customer:
    customer = get_or_404(db, customer_id)
    changes = data.model_dump(exclude_unset=True)
    if "is_active" in changes and user.role not in (UserRole.MANAGER, UserRole.ADMIN):
        raise ForbiddenError("Only managers can activate or deactivate customers")
    for field, value in changes.items():
        setattr(customer, field, value)
    db.commit()
    return customer


def deactivate(db: Session, customer_id: int) -> None:
    customer = get_or_404(db, customer_id)
    customer.is_active = False
    db.commit()
