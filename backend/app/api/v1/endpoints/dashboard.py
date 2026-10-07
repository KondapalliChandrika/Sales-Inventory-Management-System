from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.dashboard import DashboardSummary, TrendPoint
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    return dashboard_service.get_summary(db)


@router.get("/sales-trend", response_model=list[TrendPoint])
def sales_trend(days: int = Query(30, ge=7, le=365), db: Session = Depends(get_db)):
    return dashboard_service.get_sales_trend(db, days)
