from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from core.dependencies import require_admin
from database.connection import get_db
from domain.user.schema import UserResponse, AdminCreateUserRequest, UserListResponse
from domain.user.model import User
from domain.user.enums import UserStatus
from domain.prediction.model import Prediction
from core.security import hash_password

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users", response_model=UserListResponse, summary="Lấy danh sách người dùng")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(User).count()
    return UserListResponse(users=users, total=total, skip=skip, limit=limit)

@router.post("/users", response_model=UserResponse, summary="Admin tạo tài khoản nhân viên")
async def create_user(
    data: AdminCreateUserRequest,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if email exists
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng.")
    
    new_user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        status=UserStatus.ACTIVE,  # Active directly without OTP
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/stats", summary="Thống kê hệ thống cho Dashboard")
async def get_dashboard_stats(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_predictions = db.query(Prediction).count()
    
    # Calculate approved vs rejected
    approved_count = db.query(Prediction).filter(Prediction.decision == "APPROVE").count()
    rejected_count = db.query(Prediction).filter(Prediction.decision == "REJECT").count()
    review_count = db.query(Prediction).filter(Prediction.decision == "REVIEW").count()
    
    # Group by date for the chart (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Postgres specific date truncation, fallback to SQLite if needed
    try:
        daily_stats_query = db.query(
            func.date(Prediction.created_at).label('date'),
            func.count(Prediction.id).label('count')
        ).filter(Prediction.created_at >= thirty_days_ago) \
         .group_by(func.date(Prediction.created_at)) \
         .order_by(func.date(Prediction.created_at)).all()
    except Exception:
        # Fallback for some SQL engines that might not support func.date directly 
        daily_stats_query = []
        
    daily_stats = [{"date": str(row.date), "count": row.count} for row in daily_stats_query]
    
    return {
        "total_users": total_users,
        "total_predictions": total_predictions,
        "decisions": {
            "approve": approved_count,
            "reject": rejected_count,
            "review": review_count
        },
        "daily_predictions": daily_stats
    }
