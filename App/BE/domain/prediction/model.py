"""
domain/prediction/model.py — SQLAlchemy ORM model for credit risk predictions.
Moved from database/models.py — logic unchanged.
"""
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from database.base import Base


class Prediction(Base):
    """Stores the full history of credit scoring evaluations."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Raw inputs (16 fields)
    person_age = Column(Integer, nullable=False)
    person_income = Column(Float, nullable=False)
    loan_amnt = Column(Float, nullable=False)
    loan_intent = Column(String(50), nullable=False)
    loan_term_months = Column(Integer, nullable=False)
    has_prior_default = Column(Integer, nullable=False)  # 0 or 1

    # Extended inputs (added via migration)
    person_emp_length = Column(Float, nullable=True)
    education_level = Column(String(50), nullable=True)
    employment_type = Column(String(50), nullable=True)
    person_home_ownership = Column(String(50), nullable=True)
    loan_int_rate = Column(Float, nullable=True)
    cb_person_cred_hist_length = Column(Float, nullable=True)
    open_accounts = Column(Integer, nullable=True)
    past_delinquencies = Column(Integer, nullable=True)
    credit_utilization_ratio = Column(Float, nullable=True)
    other_debt = Column(Float, nullable=True)

    # Computed outputs
    proba = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    risk_tier = Column(String(20), nullable=False)
    decision = Column(String(50), nullable=False)
    top_reasons = Column(JSONB, nullable=True)

    # Ownership
    from sqlalchemy import ForeignKey
    from sqlalchemy.orm import relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", backref="predictions")


class ModelMetadata(Base):
    """Tracks deployed model versions and performance metrics."""
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    version = Column(String(20), nullable=False, unique=True)
    roc_auc = Column(Float, nullable=False)
    pr_auc = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    deployed_at = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(Text, nullable=True)
