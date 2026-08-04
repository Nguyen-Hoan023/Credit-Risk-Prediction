"""
service/prediction_service.py — Business logic for credit risk prediction.
Extracted from main.py — ALL ML logic preserved 100% unchanged.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from domain.prediction.schema import PredictRequest, PredictResponse
from ml.model import is_loaded, predict_proba
from ml.preprocess import build_feature_dataframe
from ml.scoring import (
    apply_business_rules,
    assign_decision,
    assign_risk_tier,
    generate_recommendations,
    is_approved,
    prob_to_score,
)
from repository.prediction_repository import PredictionRepository


class PredictionService:
    """Orchestrates the full credit scoring pipeline."""

    def __init__(self, db: Session) -> None:
        self.repo = PredictionRepository(db)

    def predict(self, request: PredictRequest, user_id: int) -> PredictResponse:
        """
        Run the full 9-step credit scoring pipeline.
        Logic is 100% identical to the original main.py implementation.
        """
        try:
            # Step 1: Feature engineering → 22 features
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

            # Step 2: LightGBM predict
            prob = predict_proba(df)

            # Step 3: PD → Credit Score (Log-Odds)
            score = prob_to_score(prob)

            # Step 4: Score → Risk Tier + Decision
            risk_level = assign_risk_tier(score)
            decision = assign_decision(score)
            approved = is_approved(score)

            # Step 5: Compute ratios
            safe_income = max(request.person_income, 1.0)
            lti = request.loan_amnt / safe_income
            dti = (request.other_debt + request.loan_amnt) / safe_income

            # Step 6: Apply business rules
            score, risk_level, decision, approved = apply_business_rules(
                score=score,
                risk_level=risk_level,
                decision=decision,
                approved=approved,
                cb_person_default_on_file=request.cb_person_default_on_file,
                past_delinquencies=request.past_delinquencies,
                loan_to_income_ratio=lti,
                debt_to_income_ratio=dti,
            )

            # Step 7: Generate recommendations
            recommendations = generate_recommendations(
                score=score,
                risk_level=risk_level,
                person_income=request.person_income,
                loan_amnt=request.loan_amnt,
                other_debt=request.other_debt,
                credit_utilization_ratio=request.credit_utilization_ratio,
                past_delinquencies=request.past_delinquencies,
                cb_person_default_on_file=request.cb_person_default_on_file,
                loan_to_income_ratio=lti,
                debt_to_income_ratio=dti,
                person_home_ownership=request.person_home_ownership,
                loan_intent=request.loan_intent,
            )

            # Step 8: Persist to database
            try:
                self.repo.create(
                    person_age=request.person_age,
                    person_income=request.person_income,
                    loan_amnt=request.loan_amnt,
                    loan_intent=request.loan_intent,
                    loan_term_months=request.loan_term_months,
                    has_prior_default=1 if request.cb_person_default_on_file == "Y" else 0,
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
                    top_reasons=recommendations,
                    user_id=user_id,
                )
            except Exception as db_err:
                import traceback
                error_msg = traceback.format_exc()
                print(f"[PredictionService] DB save failed (non-fatal):\n{error_msg}")
                recommendations.append({
                    "code": "LEGACY_TEXT",
                    "params": {"text": f"Lỗi lưu DB: {str(db_err)}"}
                })

            # Step 9: Return response
            return PredictResponse(
                credit_score=score,
                approval_probability=round((1 - prob) * 100, 2),
                probability_of_default=round(prob, 4),
                risk_level=risk_level,
                decision=decision,
                approved=approved,
                recommendations=recommendations,
            )

        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Lỗi xử lý hồ sơ: {str(exc)}")

    def get_history(self, limit: int = 100, user_id: int = None):
        """Return recent prediction history from database."""
        return self.repo.get_recent(limit=limit, user_id=user_id)

    def clear_history(self) -> dict:
        """Delete all prediction records."""
        count = self.repo.delete_all()
        return {"message": "Đã xoá toàn bộ lịch sử.", "deleted_count": count}
