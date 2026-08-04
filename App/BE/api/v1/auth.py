"""
api/v1/auth.py — Authentication endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database.connection import get_db
from domain.user.schema import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    VerifyOtpRequest,
)
from service.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=MessageResponse, summary="Đăng ký tài khoản nhân viên")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register → receive 6-digit OTP via email."""
    svc = AuthService(db)
    result = svc.register(data)
    return MessageResponse(**result)


@router.post("/verify-otp", response_model=TokenResponse, summary="Xác nhận OTP sau đăng ký")
async def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    """Verify OTP → activate account → receive access + refresh tokens."""
    svc = AuthService(db)
    return svc.verify_otp(data)


@router.post("/resend-otp", response_model=MessageResponse, summary="Gửi lại mã OTP")
async def resend_otp(data: ResendOtpRequest, db: Session = Depends(get_db)):
    """Resend OTP (max 3 times per session)."""
    svc = AuthService(db)
    result = svc.resend_otp(data)
    return MessageResponse(**result)


@router.post("/login", response_model=TokenResponse, summary="Đăng nhập")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login with email + password → receive JWT token pair."""
    svc = AuthService(db)
    return svc.login(data)


@router.post("/refresh", response_model=TokenResponse, summary="Làm mới Access Token")
async def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Exchange valid refresh token for a new access + refresh token pair."""
    svc = AuthService(db)
    return svc.refresh_token(data)


@router.post("/forgot-password", response_model=MessageResponse, summary="Quên mật khẩu")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send OTP to email for password reset."""
    svc = AuthService(db)
    result = svc.forgot_password(data)
    return MessageResponse(**result)


@router.post("/reset-password", response_model=MessageResponse, summary="Đặt lại mật khẩu")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Verify OTP then set new password."""
    svc = AuthService(db)
    result = svc.reset_password(data)
    return MessageResponse(**result)


@router.get("/me", response_model=UserResponse, summary="Thông tin tài khoản hiện tại")
async def get_me(current_user=Depends(get_current_user)):
    """Return authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse, summary="Đăng xuất")
async def logout(current_user=Depends(get_current_user)):
    """Stateless logout — client should discard tokens."""
    return MessageResponse(message=f"Đã đăng xuất khỏi tài khoản {current_user.email}.")
