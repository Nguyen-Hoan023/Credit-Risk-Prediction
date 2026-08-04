"""
domain/user/schema.py — Pydantic request/response schemas for User domain.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator

from domain.user.enums import UserRole, UserStatus


# ── Auth Requests ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Họ và tên đầy đủ")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Mật khẩu (tối thiểu 8 ký tự)")
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6, description="Mã OTP 6 chữ số")


class ResendOtpRequest(BaseModel):
    email: EmailStr
    purpose: str = Field(default="verify_register", description="'verify_register' hoặc 'reset_password'")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return self


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Auth Responses ────────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


# ── User Responses ────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    status: UserStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    skip: int
    limit: int


# ── Admin Requests ────────────────────────────────────────────────────────────

class AdminResetPasswordRequest(BaseModel):
    """Admin forces a new password for a staff account."""
    new_password: str = Field(..., min_length=8, max_length=128)

class AdminCreateUserRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.STAFF

class AdminUpdateUserStatusRequest(BaseModel):
    status: UserStatus
