from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.customer import Customer
from app.models.inventory import InventoryMovement
from app.models.order import OrderApproval, SalesOrder
from app.models.setting import AppSetting
from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import UserCreate, UserUpdate


def get_or_404(db: Session, user_id: int) -> User:
    user = user_repo.get(db, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


def create(db: Session, data: UserCreate) -> User:
    email = data.email.lower()
    if user_repo.get_by_email(db, email):
        raise ConflictError("A user with this email already exists", code="EMAIL_TAKEN")
    user = User(name=data.name, email=email, role=data.role, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    return user


def update(db: Session, user_id: int, data: UserUpdate, current_user: User) -> User:
    user = get_or_404(db, user_id)
    changes = data.model_dump(exclude_unset=True)
    if user.id == current_user.id and (changes.get("is_active") is False or "role" in changes):
        raise BusinessRuleError("You cannot deactivate yourself or change your own role")
    if password := changes.pop("password", None):
        user.password_hash = hash_password(password)
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    return user


def _has_activity(db: Session, user_id: int) -> bool:
    references = (
        SalesOrder.created_by,
        OrderApproval.acted_by,
        InventoryMovement.created_by,
        Customer.created_by,
        AppSetting.updated_by,
    )
    return any(db.scalar(select(exists().where(column == user_id))) for column in references)


def delete(db: Session, user_id: int, current_user: User) -> None:
    user = get_or_404(db, user_id)
    if user.id == current_user.id:
        raise BusinessRuleError("You cannot delete your own account")
    if _has_activity(db, user.id):
        raise ConflictError(
            f"{user.name} has orders, approvals or stock records, so they can't be deleted. Disable the account instead.",
            code="USER_HAS_ACTIVITY",
        )
    db.delete(user)
    db.commit()
