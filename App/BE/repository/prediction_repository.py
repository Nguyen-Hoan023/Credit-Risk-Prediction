"""
repository/prediction_repository.py — Data access layer for Prediction.
Refactored from database/crud.py — logic preserved, wrapped in class.
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from domain.prediction.model import ModelMetadata, Prediction


class PredictionRepository:
    """All database operations for the Prediction entity."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        person_age: int,
        person_income: float,
        loan_amnt: float,
        loan_intent: str,
        loan_term_months: int,
        has_prior_default: int,
        proba: float,
        credit_score: int,
        risk_tier: str,
        decision: str,
        person_emp_length: Optional[float] = None,
        education_level: Optional[str] = None,
        employment_type: Optional[str] = None,
        person_home_ownership: Optional[str] = None,
        loan_int_rate: Optional[float] = None,
        cb_person_cred_hist_length: Optional[float] = None,
        open_accounts: Optional[int] = None,
        past_delinquencies: Optional[int] = None,
        credit_utilization_ratio: Optional[float] = None,
        other_debt: Optional[float] = None,
        top_reasons: Optional[List] = None,
        user_id: Optional[int] = None,
    ) -> Prediction:
        record = Prediction(
            person_age=person_age,
            person_income=person_income,
            loan_amnt=loan_amnt,
            loan_intent=loan_intent,
            loan_term_months=loan_term_months,
            has_prior_default=has_prior_default,
            person_emp_length=person_emp_length,
            education_level=education_level,
            employment_type=employment_type,
            person_home_ownership=person_home_ownership,
            loan_int_rate=loan_int_rate,
            cb_person_cred_hist_length=cb_person_cred_hist_length,
            open_accounts=open_accounts,
            past_delinquencies=past_delinquencies,
            credit_utilization_ratio=credit_utilization_ratio,
            other_debt=other_debt,
            proba=proba,
            credit_score=credit_score,
            risk_tier=risk_tier,
            decision=decision,
            top_reasons=top_reasons,
            user_id=user_id,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_recent(self, limit: int = 100, user_id: Optional[int] = None) -> List[Prediction]:
        query = self.db.query(Prediction)
        if user_id is not None:
            query = query.filter(Prediction.user_id == user_id)
        return (
            query.order_by(Prediction.created_at.desc())
            .limit(limit)
            .all()
        )

    def delete_all(self) -> int:
        try:
            count = self.db.query(Prediction).delete()
            self.db.commit()
            return count
        except Exception:
            self.db.rollback()
            raise
