"""
api/v1/predictions.py — Credit risk prediction and history endpoints.
All endpoints now require JWT authentication.
"""
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.dependencies import require_admin, require_staff_or_admin
from database.connection import get_db
from domain.prediction.schema import HistoryItem, PredictRequest, PredictResponse
from service.prediction_service import PredictionService

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.post("/predict", response_model=PredictResponse, summary="Chấm điểm tín dụng")
async def predict(
    request: PredictRequest,
    current_user=Depends(require_staff_or_admin),
    db: Session = Depends(get_db),
):
    """
    Submit 16 credit parameters → LightGBM pipeline → credit score + decision.
    Requires: Staff or Admin JWT token.
    """
    svc = PredictionService(db)
    return svc.predict(request, user_id=current_user.id)


@router.get("/history", response_model=List[HistoryItem], summary="Lịch sử đánh giá")
async def get_history(
    limit: int = Query(default=100, ge=1, le=1000),
    current_user=Depends(require_staff_or_admin),
    db: Session = Depends(get_db),
):
    """
    Retrieve recent prediction history.
    Requires: Staff or Admin JWT token.
    """
    svc = PredictionService(db)
    user_id = None if current_user.role == "admin" else current_user.id
    return svc.get_history(limit=limit, user_id=user_id)


@router.delete("/history", summary="Xoá toàn bộ lịch sử")
async def clear_history(
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Delete all prediction records.
    Requires: Admin JWT token (replaces old X-Admin-Key header).
    """
    svc = PredictionService(db)
    return svc.clear_history()
