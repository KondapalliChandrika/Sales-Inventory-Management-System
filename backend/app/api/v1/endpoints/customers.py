from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import MANAGERS, get_current_user, require_roles
from app.models.user import User
from app.repositories import customer_repo
from app.schemas.common import Page
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.services import customer_service
from app.utils.pagination import PageParams, paginate

router = APIRouter(prefix="/customers", tags=["Customers"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=Page[CustomerOut])
def list_customers(
    search: str | None = Query(None, max_length=100),
    active: bool | None = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
):
    return paginate(db, customer_repo.list_query(search, active), params)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_or_404(db, customer_id)


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return customer_service.create(db, data, user)


@router.patch("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, data: CustomerUpdate, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    return customer_service.update(db, customer_id, data, user)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_roles(*MANAGERS))])
def deactivate_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service.deactivate(db, customer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
