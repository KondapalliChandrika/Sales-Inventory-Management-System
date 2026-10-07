from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import MANAGERS, get_current_user, require_roles
from app.models.enums import OrderStatus
from app.models.user import User
from app.schemas.common import Page
from app.schemas.order import ApproveRequest, OrderCreate, OrderListItem, OrderOut, RejectRequest
from app.services import email_service, order_service
from app.utils.pagination import PageParams

router = APIRouter(tags=["Orders & Approvals"])
managers_only = require_roles(*MANAGERS)


@router.get("/orders", response_model=Page[OrderListItem])
def list_orders(
    status_: OrderStatus | None = Query(None, alias="status"),
    customer_id: int | None = None,
    search: str | None = Query(None, max_length=100),
    date_from: date | None = None,
    date_to: date | None = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return order_service.list_orders(
        db, user, params, status=status_, customer_id=customer_id,
        search=search, date_from=date_from, date_to=date_to,
    )


@router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, background: BackgroundTasks, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    order = order_service.create_order(db, data, user)
    if order.status == OrderStatus.PENDING_APPROVAL:
        background.add_task(email_service.notify_approval_required, order.id)
    return order


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return order_service.get_order(db, order_id, user)


@router.post("/orders/{order_id}/approve", response_model=OrderOut)
def approve_order(order_id: int, data: ApproveRequest, background: BackgroundTasks,
                  db: Session = Depends(get_db), manager: User = Depends(managers_only)):
    order = order_service.approve_order(db, order_id, manager, data.comment)
    background.add_task(email_service.notify_order_decision, order.id)
    return order


@router.post("/orders/{order_id}/reject", response_model=OrderOut)
def reject_order(order_id: int, data: RejectRequest, background: BackgroundTasks,
                 db: Session = Depends(get_db), manager: User = Depends(managers_only)):
    order = order_service.reject_order(db, order_id, manager, data.reason)
    background.add_task(email_service.notify_order_decision, order.id)
    return order


@router.post("/orders/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return order_service.cancel_order(db, order_id, user)


@router.get("/approvals/pending", response_model=Page[OrderListItem], dependencies=[Depends(managers_only)])
def pending_approvals(search: str | None = Query(None, max_length=100), params: PageParams = Depends(),
                      db: Session = Depends(get_db)):
    return order_service.list_pending(db, params, search)
