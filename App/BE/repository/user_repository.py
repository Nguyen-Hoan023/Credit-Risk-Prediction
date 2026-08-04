"""
repository/user_repository.py — Data access layer for User and OtpCode.
Single Responsibility: only DB operations, no business logic.
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from core.config import settings
from domain.user.enums import OtpPurpose, UserRole, UserStatus
from domain.user.model import OtpCode, User


class UserRepository:
    """All database operations for the User entity."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def create(
        self,
        email: str,
        full_name: str,
        hashed_password: str,
        role: UserRole = UserRole.STAFF,
    ) -> User:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            role=role,
            status=UserStatus.PENDING,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_status(self, user_id: int, status: UserStatus) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.status = status
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_password(self, user_id: int, hashed_password: str) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.hashed_password = hashed_password
            self.db.commit()
            self.db.refresh(user)
        return user

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        status: Optional[UserStatus] = None,
    ) -> List[User]:
        query = self.db.query(User)
        if status is not None:
            query = query.filter(User.status == status)
        return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    def count(self, status: Optional[UserStatus] = None) -> int:
        query = self.db.query(User)
        if status is not None:
            query = query.filter(User.status == status)
        return query.count()

    def delete(self, user_id: int) -> bool:
        user = self.get_by_id(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False

    def email_exists(self, email: str) -> bool:
        return self.db.query(User.id).filter(User.email == email).first() is not None


class OtpRepository:
    """All database operations for the OtpCode entity."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, user_id: int, code: str, purpose: OtpPurpose) -> OtpCode:
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.OTP_EXPIRE_MINUTES
        )
        otp = OtpCode(
            user_id=user_id,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
            is_used=False,
            resend_count=0,
        )
        self.db.add(otp)
        self.db.commit()
        self.db.refresh(otp)
        return otp

    def get_latest_active(self, user_id: int, purpose: OtpPurpose) -> Optional[OtpCode]:
        """Get the most recent non-used OTP for this user/purpose."""
        return (
            self.db.query(OtpCode)
            .filter(
                OtpCode.user_id == user_id,
                OtpCode.purpose == purpose,
                OtpCode.is_used == False,  # noqa: E712
            )
            .order_by(OtpCode.created_at.desc())
            .first()
        )

    def mark_used(self, otp_id: int) -> None:
        otp = self.db.query(OtpCode).filter(OtpCode.id == otp_id).first()
        if otp:
            otp.is_used = True
            self.db.commit()

    def increment_resend(self, otp_id: int) -> int:
        """Increment resend counter and return the new count."""
        otp = self.db.query(OtpCode).filter(OtpCode.id == otp_id).first()
        if otp:
            otp.resend_count += 1
            self.db.commit()
            return otp.resend_count
        return 0

    def invalidate_all(self, user_id: int, purpose: OtpPurpose) -> None:
        """Mark all pending OTPs for this user/purpose as used."""
        self.db.query(OtpCode).filter(
            OtpCode.user_id == user_id,
            OtpCode.purpose == purpose,
            OtpCode.is_used == False,  # noqa: E712
        ).update({"is_used": True})
        self.db.commit()
