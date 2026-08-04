"""
api/v1/users.py — Admin-only user management endpoints.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.dependencies import require_admin
from database.connection import get_db
from domain.user.schema import (
    AdminResetPasswordRequest,
    MessageResponse,
    UserListResponse,
    UserResponse,
)
from service.user_service import UserService

router = APIRouter(prefix="/admin/users", tags=["Admin — User Management"])


@router.get("", response_model=UserListResponse, summary="Danh sách nhân viên")
async def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    status: Optional[str] = Query(default=None, description="Lọc theo trạng thái: pending | active | blocked"),
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all staff accounts with optional status filter and pagination."""
    svc = UserService(db)
    return svc.list_users(skip=skip, limit=limit, status_filter=status)


@router.get("/{user_id}", response_model=UserResponse, summary="Chi tiết nhân viên")
async def get_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    svc = UserService(db)
    return svc.get_user(user_id)


@router.patch("/{user_id}/activate", response_model=UserResponse, summary="Kích hoạt tài khoản")
async def activate_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin manually activates a PENDING account (bypass OTP flow)."""
    svc = UserService(db)
    return svc.activate_user(user_id)


@router.patch("/{user_id}/block", response_model=UserResponse, summary="Khoá tài khoản")
async def block_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    svc = UserService(db)
    return svc.block_user(user_id, admin_id=admin.id)


@router.patch("/{user_id}/unblock", response_model=UserResponse, summary="Mở khoá tài khoản")
async def unblock_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    svc = UserService(db)
    return svc.unblock_user(user_id)


@router.post("/{user_id}/reset-password", response_model=MessageResponse, summary="Đặt lại mật khẩu nhân viên")
async def admin_reset_password(
    user_id: int,
    data: AdminResetPasswordRequest,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin directly sets a new password for a staff account."""
    svc = UserService(db)
    result = svc.admin_reset_password(user_id, data)
    return MessageResponse(**result)


@router.delete("/{user_id}", response_model=MessageResponse, summary="Xoá tài khoản nhân viên")
async def delete_user(
    user_id: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db),
):
    svc = UserService(db)
    result = svc.delete_user(user_id, admin_id=admin.id)
    return MessageResponse(**result)
