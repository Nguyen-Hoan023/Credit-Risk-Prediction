"""
schema.py -- Pydantic schemas cho Request/Response validation.
Tat ca input tu frontend duoc validate tu dong.
Sai kieu du lieu hoac thieu field -> tra loi 422 ngay, khong vao den model.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Any, Dict
from datetime import datetime


# Request -- 16 bien goc tu nguoi dung nhap
class PredictRequest(BaseModel):
    # Thong tin ca nhan
    person_age: int = Field(..., ge=18, le=80, description="Tuoi (18-80)")
    person_income: float = Field(..., gt=0, description="Thu nhap hang nam (USD)")
    person_emp_length: Optional[float] = Field(None, ge=0, le=60, description="So nam lam viec (de trong neu khong co)")
    education_level: str = Field(..., description="Trinh do hoc van: High School / Bachelor / Master / PhD")
    employment_type: str = Field(..., description="Loai hinh cong viec: Full-time / Part-time / Self-employed / Unemployed")
    person_home_ownership: str = Field(..., description="Tinh trang nha o: RENT / OWN / MORTGAGE / OTHER")

    # Thong tin khoan vay
    loan_amnt: float = Field(..., gt=0, description="So tien muon vay (USD)")
    loan_int_rate: Optional[float] = Field(None, ge=0, le=40, description="Lai suat khoan vay (%), de trong neu chua biet")
    loan_term_months: int = Field(..., gt=0, description="Thoi han vay (thang)")
    loan_intent: str = Field(..., description="Muc dich vay: PERSONAL / MEDICAL / EDUCATION / VENTURE / HOMEIMPROVEMENT / DEBTCONSOLIDATION")

    # Lich su tin dung
    cb_person_cred_hist_length: float = Field(..., ge=0, description="Lich su tin dung (nam)")
    open_accounts: int = Field(..., ge=0, description="So tai khoan tin dung dang mo")
    past_delinquencies: int = Field(..., ge=0, description="So lan tre han thanh toan")
    cb_person_default_on_file: str = Field(..., description="Co tien su vo no? Y / N")
    credit_utilization_ratio: float = Field(..., ge=0, le=1, description="Ty le su dung tin dung (0.0-1.0)")

    # No khac
    other_debt: float = Field(..., ge=0, description="No khac (USD)")

    @model_validator(mode="after")
    def validate_age_relations(self) -> "PredictRequest":
        # 1. Số năm làm việc không được lớn hơn Tuổi - 14
        if self.person_emp_length is not None:
            max_emp_length = self.person_age - 14
            if self.person_emp_length > max_emp_length:
                raise ValueError(
                    f"Số năm làm việc ({self.person_emp_length}) không được lớn hơn Tuổi - 14 ({max_emp_length})"
                )

        # 2. Số năm sử dụng tín dụng không được lớn hơn Tuổi - 18
        max_cred_hist = self.person_age - 18
        if self.cb_person_cred_hist_length > max_cred_hist:
            raise ValueError(
                f"Số năm sử dụng tín dụng ({self.cb_person_cred_hist_length}) không được lớn hơn Tuổi - 18 ({max_cred_hist})"
            )

        return self


# Response -- Ket qua danh gia tin dung
class PredictResponse(BaseModel):
    credit_score: int = Field(..., description="Diem tin dung (300-850)")
    approval_probability: float = Field(..., description="Kha nang duoc phe duyet (%)")
    probability_of_default: float = Field(..., description="Xac suat vo no (0.0-1.0)")
    risk_level: str = Field(..., description="Muc rui ro: low / medium / high")
    decision: str = Field(..., description="Quyet dinh: REJECT / REVIEW / APPROVE")
    approved: bool = Field(..., description="True neu duoc phe duyet")
    recommendations: List[Dict[str, Any]] = Field(..., description="Danh sach khuyen nghi [{code, params}]")


# Health Check Response
class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool = False
    timestamp: str = ""


# History Item -- Ban ghi lich su danh gia
class HistoryItem(BaseModel):
    id: int
    created_at: datetime
    
    # Inputs
    person_age: int
    person_income: float
    loan_amnt: float
    loan_intent: str
    loan_term_months: int
    has_prior_default: int
    
    # Cac truong dau vao bo sung (de trong hoac null voi ban ghi cu)
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
    
    # Outputs
    proba: float
    credit_score: int
    risk_tier: str
    decision: str
    top_reasons: Optional[List[Any]] = None

    class Config:
        from_attributes = True
