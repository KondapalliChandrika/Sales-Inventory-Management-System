from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.repositories import user_repo
from app.schemas.common import Page
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services import user_service
from app.utils.pagination import PageParams, paginate

router = APIRouter(prefix="/users", tags=["Users"])
admin_only = require_roles(UserRole.ADMIN)


@router.get("", response_model=Page[UserOut], dependencies=[Depends(admin_only)])
def list_users(search: str | None = Query(None, max_length=100), params: PageParams = Depends(),
               db: Session = Depends(get_db)):
    return paginate(db, user_repo.list_query(search), params)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_only)])
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create(db, data)


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    return user_service.update(db, user_id, data, admin)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(admin_only)):
    user_service.delete(db, user_id, admin)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
