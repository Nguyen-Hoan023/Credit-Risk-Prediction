"""
main.py -- FastAPI entry point.
Su dung lifespan context manager (chuan FastAPI hien dai) de load model luc startup.
"""

from typing import List
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from schema import PredictRequest, PredictResponse, HealthResponse, HistoryItem
from model import load_artifacts, is_loaded, predict_proba
from preprocess import build_feature_dataframe
from scoring import (
    prob_to_score,
    assign_risk_tier,
    assign_decision,
    is_approved,
    generate_recommendations,
    apply_business_rules,
)
from database.connection import get_db
from database.models import Prediction, ModelMetadata
import database.crud as crud


# Lifespan -- Load model 1 lan khi server khoi dong
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load artifacts khi startup, cleanup khi shutdown."""
    print("[main.py] Starting up - loading model artifacts...")
    load_artifacts()
    
    # Tu dong tao bang database neu co ket noi
    try:
        from database.connection import engine, Base
        import database.models
        from sqlalchemy import inspect, text
        if engine is not None:
            print("[main.py] Checking and creating database tables...")
            Base.metadata.create_all(bind=engine)
            
            # Tu dong dong bo cac cot moi neu bang predictions da ton tai
            inspector = inspect(engine)
            existing_columns = {col["name"] for col in inspector.get_columns("predictions")}
            required_columns = {
                "person_emp_length": "FLOAT",
                "education_level": "VARCHAR(50)",
                "employment_type": "VARCHAR(50)",
                "person_home_ownership": "VARCHAR(50)",
                "loan_int_rate": "FLOAT",
                "cb_person_cred_hist_length": "FLOAT",
                "open_accounts": "INTEGER",
                "past_delinquencies": "INTEGER",
                "credit_utilization_ratio": "FLOAT",
                "other_debt": "FLOAT"
            }
            with engine.begin() as conn:
                for col_name, col_type in required_columns.items():
                    if col_name not in existing_columns:
                        print(f"[main.py] Migrating database: Adding column {col_name}...")
                        conn.execute(text(f"ALTER TABLE predictions ADD COLUMN {col_name} {col_type}"))
            print("[main.py] Database tables checked and migrated.")
    except Exception as e:
        print(f"[main.py] Database setup skipped or failed: {str(e)}")
        
    print("[main.py] Model artifacts loaded. Server ready.")
    yield
    print("[main.py] Shutting down.")


# FastAPI App
app = FastAPI(
    title="NovaBank Credit Risk Scoring API",
    description="API danh gia rui ro tin dung su dung mo hinh LightGBM",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS -- cho phep Frontend goi API
# Doc tu bien moi truong ALLOWED_ORIGINS (phan cach nhau boi dau phay)
# Dev: mac dinh cho phep localhost:3000 va :3001
# Production: set ALLOWED_ORIGINS=https://your-domain.com trong .env
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# GET /health
@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Kiem tra server con song - Render dung de health check."""
    return HealthResponse(
        status="ok",
        model_loaded=is_loaded(),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


# POST /api/predict
@app.post("/api/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict(request: PredictRequest, db: Session = Depends(get_db)):
    """
    Nhan 16 bien dau vao tu form -> tien xu ly -> du doan -> tra ket qua.
    """
    try:
        # 1. Feature Engineering - tao DataFrame 22 features
        df = build_feature_dataframe(
            person_age=request.person_age,
            person_income=request.person_income,
            other_debt=request.other_debt,
            person_emp_length=request.person_emp_length,
            loan_amnt=request.loan_amnt,
            loan_int_rate=request.loan_int_rate,
            loan_term_months=request.loan_term_months,
            cb_person_cred_hist_length=request.cb_person_cred_hist_length,
            open_accounts=request.open_accounts,
            past_delinquencies=request.past_delinquencies,
            cb_person_default_on_file=request.cb_person_default_on_file,
            credit_utilization_ratio=request.credit_utilization_ratio,
            person_home_ownership=request.person_home_ownership,
            loan_intent=request.loan_intent,
            employment_type=request.employment_type,
            education_level=request.education_level,
        )

        # 2. Predict probability of default (pipeline tu impute -> cast -> predict)
        prob = predict_proba(df)

        # 3. Probability -> Credit Score (Log-Odds)
        score = prob_to_score(prob)

        # 4. Score -> Risk Tier & Decision (tu model)
        risk_level = assign_risk_tier(score)
        decision = assign_decision(score)
        approved = is_approved(score)

        # 5. Tinh cac chi so phai sinh
        safe_income = max(request.person_income, 1.0)
        loan_to_income_ratio = request.loan_amnt / safe_income
        debt_to_income_ratio = (request.other_debt + request.loan_amnt) / safe_income

        # 6. Ap dung luat nghiep vu (2 tang: knock-out + soft downgrade)
        score, risk_level, decision, approved = apply_business_rules(
            score=score,
            risk_level=risk_level,
            decision=decision,
            approved=approved,
            cb_person_default_on_file=request.cb_person_default_on_file,
            past_delinquencies=request.past_delinquencies,
            loan_to_income_ratio=loan_to_income_ratio,
            debt_to_income_ratio=debt_to_income_ratio,
        )

        # 7. Sinh khuyen nghi hanh dong (dua tren risk_level sau luat)
        recommendations = generate_recommendations(
            score=score,
            risk_level=risk_level,
            person_income=request.person_income,
            loan_amnt=request.loan_amnt,
            other_debt=request.other_debt,
            credit_utilization_ratio=request.credit_utilization_ratio,
            past_delinquencies=request.past_delinquencies,
            cb_person_default_on_file=request.cb_person_default_on_file,
            loan_to_income_ratio=loan_to_income_ratio,
            debt_to_income_ratio=debt_to_income_ratio,
            person_home_ownership=request.person_home_ownership,
            loan_intent=request.loan_intent,
        )

        # 8. Luu lich su vao database neu co ket noi DB
        if db is not None:
            try:
                has_prior_default = 1 if request.cb_person_default_on_file == "Y" else 0
                db_record = crud.create_prediction(
                    db=db,
                    person_age=request.person_age,
                    person_income=request.person_income,
                    loan_amnt=request.loan_amnt,
                    loan_intent=request.loan_intent,
                    loan_term_months=request.loan_term_months,
                    has_prior_default=has_prior_default,
                    person_emp_length=request.person_emp_length,
                    education_level=request.education_level,
                    employment_type=request.employment_type,
                    person_home_ownership=request.person_home_ownership,
                    loan_int_rate=request.loan_int_rate,
                    cb_person_cred_hist_length=request.cb_person_cred_hist_length,
                    open_accounts=request.open_accounts,
                    past_delinquencies=request.past_delinquencies,
                    credit_utilization_ratio=request.credit_utilization_ratio,
                    other_debt=request.other_debt,
                    proba=round(prob, 4),
                    credit_score=score,
                    risk_tier=risk_level,
                    decision=decision,
                    top_reasons=recommendations
                )
                print(f"[main.py] Saved evaluation record ID {db_record.id} to database.")
            except Exception as db_err:
                print(f"[main.py] Database save failed: {str(db_err)}")

        # 9. Tra ket qua
        approval_probability = round((1 - prob) * 100, 2)
        return PredictResponse(
            credit_score=score,
            approval_probability=approval_probability,
            probability_of_default=round(prob, 4),
            risk_level=risk_level,
            decision=decision,
            approved=approved,
            recommendations=recommendations,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Loi khi xu ly ho so: {str(e)}",
        )


# GET /api/history
@app.get("/api/history", response_model=List[HistoryItem], tags=["History"])
async def get_history(limit: int = 100, db: Session = Depends(get_db)):
    """
    Truy van danh sach lich su danh gia gan nhat tu co so du lieu.
    """
    if db is None:
        print("[main.py] History request: Database is not connected.")
        return []
        
    try:
        records = crud.get_predictions(db, limit=limit)
        return records
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Loi khi truy van lich su tu database: {str(e)}",
        )


# DELETE /api/history
@app.delete("/api/history", tags=["History"])
async def clear_history(db: Session = Depends(get_db)):
    """
    Xoa toan bo lich su danh gia trong co so du lieu.
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database is not connected.",
        )
        
    try:
        deleted_count = crud.delete_all_predictions(db)
        return {"message": "Success", "deleted_count": deleted_count}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Loi khi xoa lich su: {str(e)}",
        )
