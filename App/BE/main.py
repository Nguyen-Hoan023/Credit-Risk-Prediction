"""
main.py — FastAPI application factory.
Slim entry point: only app init, lifespan, CORS, and router registration.
All business logic lives in api/, service/, repository/ layers.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.router import api_router
from core.config import settings
from ml.model import load_artifacts


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load ML model + init DB tables + seed admin. Shutdown: cleanup."""
    print("[main.py] Starting up...")

    # 1. Load LightGBM pipeline
    load_artifacts()

    # 2. Create / migrate database tables
    try:
        from database.connection import engine
        from database.base import Base

        # Import ALL models so Base.metadata knows about them
        import domain.user.model          # noqa: F401
        import domain.prediction.model   # noqa: F401

        if engine is not None:
            from sqlalchemy import inspect, text
            print("[main.py] Creating/verifying database tables...")
            Base.metadata.create_all(bind=engine)

            # Migrate legacy columns if predictions table already existed
            inspector = inspect(engine)
            if "predictions" in inspector.get_table_names():
                existing = {col["name"] for col in inspector.get_columns("predictions")}
                new_cols = {
                    "person_emp_length": "FLOAT",
                    "education_level": "VARCHAR(50)",
                    "employment_type": "VARCHAR(50)",
                    "person_home_ownership": "VARCHAR(50)",
                    "loan_int_rate": "FLOAT",
                    "cb_person_cred_hist_length": "FLOAT",
                    "open_accounts": "INTEGER",
                    "past_delinquencies": "INTEGER",
                    "credit_utilization_ratio": "FLOAT",
                    "other_debt": "FLOAT",
                }
                with engine.begin() as conn:
                    for col, typ in new_cols.items():
                        if col not in existing:
                            conn.execute(text(f"ALTER TABLE predictions ADD COLUMN {col} {typ}"))
                            print(f"[main.py] Migrated: added column predictions.{col}")
            print("[main.py] Database ready.")
    except Exception as exc:
        print(f"[main.py] Database setup skipped: {exc}")

    # 3. Seed default Admin account (only if no admin exists)
    try:
        from database.connection import SessionLocal
        if SessionLocal is not None:
            from domain.user.model import User
            from domain.user.enums import UserRole, UserStatus
            from core.security import hash_password
            db = SessionLocal()
            try:
                admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
                if not admin:
                    default_admin = User(
                        email=settings.ADMIN_EMAIL,
                        full_name="System Admin",
                        hashed_password=hash_password(settings.ADMIN_PASSWORD),
                        role=UserRole.ADMIN,
                        status=UserStatus.ACTIVE,
                    )
                    db.add(default_admin)
                    db.commit()
                    print(f"[main.py] Default Admin seeded: {settings.ADMIN_EMAIL}")
                else:
                    print(f"[main.py] Admin already exists: {admin.email}")
            finally:
                db.close()
    except Exception as exc:
        print(f"[main.py] Admin seed skipped: {exc}")

    print("[main.py] Server ready.")
    yield
    print("[main.py] Shutting down.")


# ── App Factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="NovaBank Credit Risk Scoring API",
    description="Hệ thống đánh giá rủi ro tín dụng — FastAPI + LightGBM + JWT Auth",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
cors_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://credit-risk-prediction-pi.vercel.app,http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router)
