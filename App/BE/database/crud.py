from sqlalchemy.orm import Session
from database.models import Prediction, ModelMetadata
from typing import List, Optional

def create_prediction(
    db: Session,
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
    top_reasons: Optional[List[str]] = None
) -> Prediction:
    """Tạo mới một bản ghi chấm điểm vào bảng predictions."""
    db_prediction = Prediction(
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
        top_reasons=top_reasons
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

def get_predictions(db: Session, limit: int = 100) -> List[Prediction]:
    """Lấy danh sách các bản ghi chấm điểm gần đây nhất."""
    return (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )

def create_model_metadata(
    db: Session,
    version: str,
    roc_auc: float,
    pr_auc: float,
    threshold: float,
    note: Optional[str] = None
) -> ModelMetadata:
    """Tạo mới thông tin phiên bản mô hình."""
    db_metadata = ModelMetadata(
        version=version,
        roc_auc=roc_auc,
        pr_auc=pr_auc,
        threshold=threshold,
        note=note
    )
    db.add(db_metadata)
    db.commit()
    db.refresh(db_metadata)
    return db_metadata

def get_latest_model_metadata(db: Session) -> Optional[ModelMetadata]:
    """Lấy thông tin phiên bản mô hình được triển khai gần nhất."""
    return (
        db.query(ModelMetadata)
        .order_by(ModelMetadata.deployed_at.desc())
        .first()
    )

def delete_all_predictions(db: Session) -> int:
    """Xóa toàn bộ các bản ghi chấm điểm trong bảng predictions."""
    try:
        deleted_count = db.query(Prediction).delete()
        db.commit()
        return deleted_count
    except Exception as e:
        db.rollback()
        raise e
