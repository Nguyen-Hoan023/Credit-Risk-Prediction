"""
domain/user/enums.py — Enum definitions for User domain.
Open/Closed: add new roles/statuses without modifying existing code.
"""
from enum import Enum


class UserRole(str, Enum):
    STAFF = "staff"
    ADMIN = "admin"


class UserStatus(str, Enum):
    PENDING = "pending"     # Registered but OTP not yet verified
    ACTIVE = "active"       # Verified and active
    BLOCKED = "blocked"     # Blocked by Admin


class OtpPurpose(str, Enum):
    VERIFY_REGISTER = "verify_register"
    RESET_PASSWORD = "reset_password"
