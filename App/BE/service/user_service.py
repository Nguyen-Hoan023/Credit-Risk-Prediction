"""
service/user_service.py — Admin business logic for user management.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import generate_otp, hash_password
from core.email import send_otp_email
from domain.user.enums import OtpPurpose, UserStatus
from domain.user.schema import AdminResetPasswordRequest, UserListResponse, UserResponse
from repository.user_repository import OtpRepository, UserRepository


class UserService:
    """Admin-only operations on user accounts."""

    def __init__(self, db: Session) -> None:
        self.user_repo = UserRepository(db)
        self.otp_repo = OtpRepository(db)

    def list_users(
        self,
        skip: int = 0,
        limit: int = 50,
        status_filter: str = None,
    ) -> UserListResponse:
        status_enum = None
        if status_filter:
            try:
                status_enum = UserStatus(status_filter)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Trạng thái không hợp lệ: {status_filter}")

        users = self.user_repo.get_all(skip=skip, limit=limit, status=status_enum)
        total = self.user_repo.count(status=status_enum)
        return UserListResponse(
            users=[UserResponse.model_validate(u) for u in users],
            total=total,
            skip=skip,
            limit=limit,
        )

    def get_user(self, user_id: int) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")
        return UserResponse.model_validate(user)

    def activate_user(self, user_id: int) -> UserResponse:
        """Admin manually activates a PENDING account."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")
        if user.status == UserStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Tài khoản đã được kích hoạt rồi.")
        if user.status == UserStatus.BLOCKED:
            raise HTTPException(status_code=400, detail="Tài khoản đang bị khoá, không thể activate trực tiếp. Hãy unblock trước.")

        updated = self.user_repo.update_status(user_id, UserStatus.ACTIVE)
        return UserResponse.model_validate(updated)

    def block_user(self, user_id: int, admin_id: int) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")
        if user.id == admin_id:
            raise HTTPException(status_code=400, detail="Không thể tự block tài khoản của chính mình.")
        if user.status == UserStatus.BLOCKED:
            raise HTTPException(status_code=400, detail="Tài khoản đã bị khoá rồi.")

        updated = self.user_repo.update_status(user_id, UserStatus.BLOCKED)
        return UserResponse.model_validate(updated)

    def unblock_user(self, user_id: int) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")
        if user.status != UserStatus.BLOCKED:
            raise HTTPException(status_code=400, detail="Tài khoản không ở trạng thái bị khoá.")

        updated = self.user_repo.update_status(user_id, UserStatus.ACTIVE)
        return UserResponse.model_validate(updated)

    def admin_reset_password(self, user_id: int, data: AdminResetPasswordRequest) -> dict:
        """Admin directly sets a new password for a staff account."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")

        hashed = hash_password(data.new_password)
        self.user_repo.update_password(user_id, hashed)
        return {"message": f"Mật khẩu của tài khoản {user.email} đã được đặt lại thành công."}

    def delete_user(self, user_id: int, admin_id: int) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")
        if user.id == admin_id:
            raise HTTPException(status_code=400, detail="Không thể xoá tài khoản Admin đang đăng nhập.")

        self.user_repo.delete(user_id)
        return {"message": f"Đã xoá tài khoản {user.email} thành công."}
