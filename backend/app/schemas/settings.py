from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import Money


class SettingsOut(BaseModel):
    approval_threshold: Money
    tax_rate_percent: Money


class SettingsUpdate(BaseModel):
    approval_threshold: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    tax_rate_percent: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
