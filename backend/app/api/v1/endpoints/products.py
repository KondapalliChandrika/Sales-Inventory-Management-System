from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import MANAGERS, get_current_user, require_roles
from app.models.user import User
from app.repositories import product_repo
from app.schemas.common import Page
from app.schemas.product import CategoryCreate, CategoryOut, ProductCreate, ProductOut, ProductUpdate
from app.services import product_service
from app.utils.pagination import PageParams, paginate

router = APIRouter(tags=["Products"], dependencies=[Depends(get_current_user)])
managers_only = require_roles(*MANAGERS)


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return product_repo.list_categories(db)


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(managers_only)])
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return product_service.create_category(db, data)


@router.get("/products", response_model=Page[ProductOut])
def list_products(
    search: str | None = Query(None, max_length=100),
    active: bool | None = None,
    category_id: int | None = None,
    low_stock: bool = False,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
):
    return paginate(db, product_repo.list_query(search, active, category_id, low_stock), params)


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_or_404(db, product_id)


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db), user: User = Depends(managers_only)):
    return product_service.create(db, data, user)


@router.patch("/products/{product_id}", response_model=ProductOut, dependencies=[Depends(managers_only)])
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.update(db, product_id, data)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(managers_only)])
def deactivate_product(product_id: int, db: Session = Depends(get_db)):
    product_service.deactivate(db, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
