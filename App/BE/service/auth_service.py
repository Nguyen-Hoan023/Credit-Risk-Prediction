"""
service/auth_service.py — Business logic for authentication flows.
Orchestrates: UserRepository, OtpRepository, security, email modules.
"""
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.email import send_otp_email
from core.security import (
    create_token_pair,
    decode_token,
    generate_otp,
    hash_password,
    verify_password,
)
from domain.user.enums import OtpPurpose, UserRole, UserStatus
from domain.user.schema import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyOtpRequest,
)
from repository.user_repository import OtpRepository, UserRepository


class AuthService:
    """Handles all authentication flows."""

    def __init__(self, db: Session) -> None:
        self.user_repo = UserRepository(db)
        self.otp_repo = OtpRepository(db)

    # ── Register ──────────────────────────────────────────────────────────────

    def register(self, data: RegisterRequest) -> dict:
        """Register a new staff account → send OTP email."""
        if self.user_repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email này đã được đăng ký.",
            )

        hashed = hash_password(data.password)
        user = self.user_repo.create(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hashed,
            role=UserRole.STAFF,
        )

        otp_code = generate_otp()
        self.otp_repo.create(user.id, otp_code, OtpPurpose.VERIFY_REGISTER)
        send_otp_email(user.email, otp_code, user.full_name, "verify_register")

        return {
            "message": "Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP 6 số.",
            "email": user.email,
        }

    # ── Verify OTP (Register) ─────────────────────────────────────────────────

    def verify_otp(self, data: VerifyOtpRequest) -> TokenResponse:
        """Verify OTP after registration → activate account → return tokens."""
        user = self.user_repo.get_by_email(data.email)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")

        if user.status == UserStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Tài khoản đã được kích hoạt rồi.")

        if user.status == UserStatus.BLOCKED:
            raise HTTPException(status_code=403, detail="Tài khoản đã bị khoá.")

        otp = self.otp_repo.get_latest_active(user.id, OtpPurpose.VERIFY_REGISTER)
        self._validate_otp(otp, data.otp_code)

        self.otp_repo.mark_used(otp.id)
        self.user_repo.update_status(user.id, UserStatus.ACTIVE)

        tokens = create_token_pair(user.id, user.role.value)
        return TokenResponse(**tokens)

    # ── Resend OTP ────────────────────────────────────────────────────────────

    def resend_otp(self, data: ResendOtpRequest) -> dict:
        """Resend OTP — max OTP_MAX_RESEND times per flow."""
        user = self.user_repo.get_by_email(data.email)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")

        purpose = (
            OtpPurpose.VERIFY_REGISTER
            if data.purpose == "verify_register"
            else OtpPurpose.RESET_PASSWORD
        )

        # Check existing OTP resend count
        existing = self.otp_repo.get_latest_active(user.id, purpose)
        if existing and existing.resend_count >= settings.OTP_MAX_RESEND:
            raise HTTPException(
                status_code=429,
                detail=f"Đã gửi lại OTP tối đa {settings.OTP_MAX_RESEND} lần. Vui lòng thử lại sau.",
            )

        # Invalidate old OTPs and create a fresh one
        self.otp_repo.invalidate_all(user.id, purpose)
        otp_code = generate_otp()
        new_otp = self.otp_repo.create(user.id, otp_code, purpose)

        # Carry over resend count
        if existing:
            for _ in range(existing.resend_count + 1):
                self.otp_repo.increment_resend(new_otp.id)

        send_otp_email(user.email, otp_code, user.full_name, purpose.value)
        return {"message": "Mã OTP mới đã được gửi về email của bạn."}

    # ── Login ─────────────────────────────────────────────────────────────────

    def login(self, data: LoginRequest) -> TokenResponse:
        """Verify credentials → return JWT token pair."""
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác.",
            )

        if user.status == UserStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản chưa được xác minh. Vui lòng nhập OTP đã gửi về email.",
            )
        if user.status == UserStatus.BLOCKED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản đã bị khoá. Vui lòng liên hệ Admin.",
            )

        tokens = create_token_pair(user.id, user.role.value)
        return TokenResponse(**tokens)

    # ── Refresh Token ─────────────────────────────────────────────────────────

    def refresh_token(self, data: RefreshTokenRequest) -> TokenResponse:
        """Validate refresh token → issue new access + refresh token pair."""
        try:
            payload = decode_token(data.refresh_token)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
            )

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Token không đúng loại.")

        user_id = int(payload["sub"])
        user = self.user_repo.get_by_id(user_id)
        if not user or user.status != UserStatus.ACTIVE:
            raise HTTPException(status_code=401, detail="Tài khoản không hợp lệ.")

        tokens = create_token_pair(user.id, user.role.value)
        return TokenResponse(**tokens)

    # ── Forgot Password ───────────────────────────────────────────────────────

    def forgot_password(self, data: ForgotPasswordRequest) -> dict:
        """Send OTP for password reset (always returns success to prevent email enumeration)."""
        user = self.user_repo.get_by_email(data.email)
        if user and user.status == UserStatus.ACTIVE:
            self.otp_repo.invalidate_all(user.id, OtpPurpose.RESET_PASSWORD)
            otp_code = generate_otp()
            self.otp_repo.create(user.id, otp_code, OtpPurpose.RESET_PASSWORD)
            send_otp_email(user.email, otp_code, user.full_name, "reset_password")

        return {"message": "Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến hộp thư của bạn."}

    # ── Reset Password ────────────────────────────────────────────────────────

    def reset_password(self, data: ResetPasswordRequest) -> dict:
        """Verify OTP → update password."""
        user = self.user_repo.get_by_email(data.email)
        if not user:
            raise HTTPException(status_code=404, detail="Tài khoản không tồn tại.")

        otp = self.otp_repo.get_latest_active(user.id, OtpPurpose.RESET_PASSWORD)
        self._validate_otp(otp, data.otp_code)

        self.otp_repo.mark_used(otp.id)
        hashed = hash_password(data.new_password)
        self.user_repo.update_password(user.id, hashed)

        return {"message": "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập."}

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _validate_otp(otp, entered_code: str) -> None:
        """Raise HTTPException if OTP is missing, expired, or wrong."""
        if not otp:
            raise HTTPException(status_code=400, detail="Không tìm thấy mã OTP hợp lệ.")

        now = datetime.now(timezone.utc)
        otp_expires = otp.expires_at
        # Make timezone-aware for comparison
        if otp_expires.tzinfo is None:
            from datetime import timezone as tz
            otp_expires = otp_expires.replace(tzinfo=tz.utc)

        if now > otp_expires:
            raise HTTPException(
                status_code=400,
                detail="Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.",
            )

        if otp.code != entered_code.strip():
            raise HTTPException(status_code=400, detail="Mã OTP không chính xác.")
