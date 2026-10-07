from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel, UTCDateTime
from app.utils.validators import Phone

GSTIN_PATTERN = r"^[0-9]{2}[A-Z0-9]{13}$"


class CustomerBase(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr | None = None
    phone: Phone | None = None
    address: str | None = Field(default=None, max_length=500)
    gstin: str | None = Field(default=None, pattern=GSTIN_PATTERN)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    phone: Phone | None = None
    address: str | None = Field(default=None, max_length=500)
    gstin: str | None = Field(default=None, pattern=GSTIN_PATTERN)
    is_active: bool | None = None


class CustomerOut(ORMModel):
    id: int
    name: str
    email: str | None
    phone: str | None
    address: str | None
    gstin: str | None
    is_active: bool
    created_at: UTCDateTime


class CustomerBrief(ORMModel):
    id: int
    name: str
    email: str | None
