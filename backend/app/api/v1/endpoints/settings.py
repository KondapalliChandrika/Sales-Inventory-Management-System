from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsOut, dependencies=[Depends(get_current_user)])
def get_settings(db: Session = Depends(get_db)):
    return settings_service.get_all(db)


@router.put("", response_model=SettingsOut)
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db),
                    admin: User = Depends(require_roles(UserRole.ADMIN))):
    return settings_service.update(db, data, admin)
