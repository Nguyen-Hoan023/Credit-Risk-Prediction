"""
domain/prediction/schema.py — Pydantic schemas for credit risk prediction.
Moved from schema.py — logic unchanged.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from domain.user.schema import UserResponse

from pydantic import BaseModel, Field, model_validator


# ── Request ───────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    # Personal info
    person_age: int = Field(..., ge=18, le=80, description="Tuổi (18-80)")
    person_income: float = Field(..., gt=0, description="Thu nhập hàng năm (VND)")
    person_emp_length: Optional[float] = Field(None, ge=0, le=60, description="Số năm làm việc")
    education_level: str = Field(..., description="Trình độ học vấn: High School / Bachelor / Master / PhD")
    employment_type: str = Field(..., description="Loại hình công việc: Full-time / Part-time / Self-employed / Unemployed")
    person_home_ownership: str = Field(..., description="Tình trạng nhà ở: RENT / OWN / MORTGAGE / OTHER")

    # Loan info
    loan_amnt: float = Field(..., gt=0, description="Số tiền muốn vay")
    loan_int_rate: Optional[float] = Field(None, ge=0, le=40, description="Lãi suất khoản vay (%)")
    loan_term_months: int = Field(..., gt=0, description="Thời hạn vay (tháng)")
    loan_intent: str = Field(..., description="Mục đích vay")

    # Credit history
    cb_person_cred_hist_length: float = Field(..., ge=0, description="Lịch sử tín dụng (năm)")
    open_accounts: int = Field(..., ge=0, description="Số tài khoản tín dụng đang mở")
    past_delinquencies: int = Field(..., ge=0, description="Số lần trễ hạn thanh toán")
    cb_person_default_on_file: str = Field(..., description="Có tiền sử vỡ nợ? Y / N")
    credit_utilization_ratio: float = Field(..., ge=0, le=1, description="Tỷ lệ sử dụng tín dụng (0.0-1.0)")

    # Other debt
    other_debt: float = Field(..., ge=0, description="Nợ khác hiện tại")

    @model_validator(mode="after")
    def validate_age_relations(self) -> "PredictRequest":
        if self.person_emp_length is not None:
            max_emp = self.person_age - 14
            if self.person_emp_length > max_emp:
                raise ValueError(
                    f"Số năm làm việc ({self.person_emp_length}) không được lớn hơn Tuổi - 14 ({max_emp})"
                )
        max_cred = self.person_age - 18
        if self.cb_person_cred_hist_length > max_cred:
            raise ValueError(
                f"Số năm tín dụng ({self.cb_person_cred_hist_length}) không được lớn hơn Tuổi - 18 ({max_cred})"
            )
        return self


# ── Response ──────────────────────────────────────────────────────────────────

class PredictResponse(BaseModel):
    credit_score: int = Field(..., description="Điểm tín dụng (300-850)")
    approval_probability: float = Field(..., description="Xác suất được phê duyệt (%)")
    probability_of_default: float = Field(..., description="Xác suất vỡ nợ (0.0-1.0)")
    risk_level: str = Field(..., description="Mức rủi ro: low / medium / high")
    decision: str = Field(..., description="Quyết định: REJECT / REVIEW / APPROVE")
    approved: bool
    recommendations: List[Dict[str, Any]]


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool = False
    timestamp: str = ""


# ── History ───────────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    id: int
    created_at: datetime

    person_age: int
    person_income: float
    loan_amnt: float
    loan_intent: str
    loan_term_months: int
    has_prior_default: int

    person_emp_length: Optional[float] = None
    education_level: Optional[str] = None
    employment_type: Optional[str] = None
    person_home_ownership: Optional[str] = None
    loan_int_rate: Optional[float] = None
    cb_person_cred_hist_length: Optional[float] = None
    open_accounts: Optional[int] = None
    past_delinquencies: Optional[int] = None
    credit_utilization_ratio: Optional[float] = None
    other_debt: Optional[float] = None

    proba: float
    credit_score: int
    risk_tier: str
    decision: str
    top_reasons: Optional[List[Any]] = None
    
    user_id: Optional[int] = None
    user: Optional[UserResponse] = None

    model_config = {"from_attributes": True}
