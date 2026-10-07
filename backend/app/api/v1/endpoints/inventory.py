from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import MANAGERS, get_current_user, require_roles
from app.models.user import User
from app.repositories import inventory_repo
from app.schemas.common import Page
from app.schemas.inventory import MovementOut, StockAdjustmentCreate
from app.schemas.product import ProductOut
from app.services import inventory_service
from app.utils.pagination import PageParams, paginate

router = APIRouter(prefix="/inventory", tags=["Inventory"], dependencies=[Depends(get_current_user)])


@router.post("/adjustments", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def adjust_stock(data: StockAdjustmentCreate, db: Session = Depends(get_db),
                 user: User = Depends(require_roles(*MANAGERS))):
    return inventory_service.adjust(db, data, user)


@router.get("/movements", response_model=Page[MovementOut])
def list_movements(product_id: int | None = Query(None), params: PageParams = Depends(),
                   db: Session = Depends(get_db)):
    return paginate(db, inventory_repo.movements_query(product_id), params)
