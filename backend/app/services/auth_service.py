from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.repositories import user_repo


def login(db: Session, email: str, password: str) -> tuple[str, User]:
    user = user_repo.get_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid email or password", code="INVALID_CREDENTIALS")
    if not user.is_active:
        raise UnauthorizedError("Your account is disabled", code="ACCOUNT_DISABLED")
    return create_access_token(user.id, user.role.value), user
