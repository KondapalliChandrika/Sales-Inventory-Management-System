from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User


def get(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def list_query(search: str | None = None) -> Select:
    stmt = select(User).order_by(User.name)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(User.name.ilike(like) | User.email.ilike(like))
    return stmt


def active_by_roles(db: Session, roles: list[UserRole]) -> list[User]:
    return list(db.scalars(select(User).where(User.role.in_(roles), User.is_active.is_(True))))
