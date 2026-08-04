"""
domain/user/model.py — SQLAlchemy ORM models for User and OtpCode.
"""
from sqlalchemy import (
    Boolean, Column, DateTime, Enum as SAEnum,
    ForeignKey, Integer, String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.base import Base
from domain.user.enums import OtpPurpose, UserRole, UserStatus


class User(Base):
    """Stores staff and admin accounts."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="userrole"), nullable=False, default=UserRole.STAFF)
    status = Column(SAEnum(UserStatus, name="userstatus"), nullable=False, default=UserStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    otp_codes = relationship("OtpCode", back_populates="user", cascade="all, delete-orphan")


class OtpCode(Base):
    """One-time password records for email verification and password reset."""
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(6), nullable=False)
    purpose = Column(SAEnum(OtpPurpose, name="otppurpose"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)
    resend_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="otp_codes")
