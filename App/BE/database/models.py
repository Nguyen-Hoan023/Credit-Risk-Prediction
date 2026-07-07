from sqlalchemy import Column, Integer, Float, String, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database.connection import Base

class Prediction(Base):
    """
    Bảng lưu trữ lịch sử chấm điểm tín dụng của khách hàng.
    Lưu trữ các biến đầu vào cơ bản và các kết quả tính toán đầu ra.
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    
    # Tham số đầu vào gốc (không biến đổi)
    person_age = Column(Integer, nullable=False)
    person_income = Column(Float, nullable=False)
    loan_amnt = Column(Float, nullable=False)
    loan_intent = Column(String(50), nullable=False)
    loan_term_months = Column(Integer, nullable=False)
    has_prior_default = Column(Integer, nullable=False) # 0 hoặc 1

    # Các tham số bổ sung để lưu trữ đầy đủ 16 trường đầu vào
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

    # Kết quả tính toán
    proba = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    risk_tier = Column(String(20), nullable=False) # LOW/MEDIUM/HIGH
    decision = Column(String(50), nullable=False)   # PHÊ DUYỆT/XEM XÉT/TỪ CHỐI
    top_reasons = Column(JSONB, nullable=True)     # List lý do được lưu dưới dạng JSONB

class ModelMetadata(Base):
    """
    Bảng lưu trữ phiên bản mô hình, hiệu năng của mô hình (ROC-AUC, PR-AUC)
    và ngưỡng ra quyết định đang hoạt động.
    """
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    version = Column(String(20), nullable=False, unique=True)
    roc_auc = Column(Float, nullable=False)
    pr_auc = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    deployed_at = Column(DateTime, server_default=func.now())
    note = Column(Text, nullable=True)
