"""
core/config.py — Centralized settings management using pydantic-settings.
Loads all environment variables with type safety.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ─────────────────────────────────────
    ENVIRONMENT: str = "development"

    # ── Database ─────────────────────────────────
    DATABASE_URL: str = ""

    # ── JWT ──────────────────────────────────────
    SECRET_KEY: str = "default-insecure-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── SMTP (Gmail) ─────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # ── OTP ──────────────────────────────────────
    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_RESEND: int = 3

    # ── Default Admin (seeded on startup) ────────
    ADMIN_EMAIL: str = "admin@novabank.com"
    ADMIN_PASSWORD: str = "admin@123"

    # ── CORS ─────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # ── Legacy (kept for backward compat) ────────
    ADMIN_API_KEY: str = ""

    model_config = {"env_file": ".env", "extra": "allow"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
