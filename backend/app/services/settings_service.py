from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings as app_config
from app.models.setting import AppSetting
from app.models.user import User
from app.schemas.settings import SettingsOut, SettingsUpdate

APPROVAL_THRESHOLD = "ORDER_APPROVAL_THRESHOLD"
TAX_RATE_PERCENT = "TAX_RATE_PERCENT"

_DEFAULTS = {
    APPROVAL_THRESHOLD: app_config.DEFAULT_APPROVAL_THRESHOLD,
    TAX_RATE_PERCENT: app_config.DEFAULT_TAX_RATE_PERCENT,
}


def _get_decimal(db: Session, key: str) -> Decimal:
    row = db.get(AppSetting, key)
    return Decimal(row.value) if row else Decimal(_DEFAULTS[key])


def get_approval_threshold(db: Session) -> Decimal:
    return _get_decimal(db, APPROVAL_THRESHOLD)


def get_tax_rate(db: Session) -> Decimal:
    return _get_decimal(db, TAX_RATE_PERCENT)


def get_all(db: Session) -> SettingsOut:
    return SettingsOut(approval_threshold=get_approval_threshold(db), tax_rate_percent=get_tax_rate(db))


def update(db: Session, data: SettingsUpdate, user: User) -> SettingsOut:
    mapping = {APPROVAL_THRESHOLD: data.approval_threshold, TAX_RATE_PERCENT: data.tax_rate_percent}
    for key, value in mapping.items():
        if value is None:
            continue
        row = db.get(AppSetting, key)
        if row is None:
            db.add(AppSetting(key=key, value=str(value), updated_by=user.id))
        else:
            row.value = str(value)
            row.updated_by = user.id
    db.commit()
    return get_all(db)
