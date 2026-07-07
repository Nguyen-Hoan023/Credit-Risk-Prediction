"""
scoring.py -- Chuyen doi xac suat vo no -> Credit Score (Log-Odds) -> Risk Tier
va sinh khuyen nghi hanh dong theo luat nguong nghiep vu ngan hang.
"""

import json
import os
import numpy as np

# Load metadata config
_ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
with open(os.path.join(_ARTIFACT_DIR, "metadata.json"), "r") as f:
    _METADATA = json.load(f)

SCORE_MIN: int = _METADATA["score_min"]       # 300
SCORE_MAX: int = _METADATA["score_max"]       # 850
PDO: int = _METADATA["pdo"]                    # 20
BASE_SCORE: int = _METADATA["base_score"]      # 600
HIGH_RISK_MAX: int = _METADATA["band_config"]["high_risk_max"]      # 616
MEDIUM_RISK_MAX: int = _METADATA["band_config"]["medium_risk_max"]  # 643


# Prob -> Score (Log-Odds)
def prob_to_score(prob: float) -> int:
    """
    Chuyen xac suat vo no (probability of default) -> credit score 300-850.
    Cong thuc Log-Odds chuan theo FICO:
        factor = PDO / ln(2)
        offset = BASE_SCORE  (vi log(1) = 0)
        odds   = (1 - prob) / prob
        score  = offset + factor * ln(odds)
    """
    prob = float(np.clip(prob, 1e-6, 1 - 1e-6))   # Tranh log(0) va chia 0
    factor = PDO / np.log(2)
    offset = BASE_SCORE  # offset = base_score - factor * log(1) = base_score

    odds = (1 - prob) / prob
    score = offset + factor * np.log(odds)

    return int(np.clip(score, SCORE_MIN, SCORE_MAX))


# Score -> Risk Tier
def assign_risk_tier(score: int) -> str:
    """high / medium / low dua tren band_config trong metadata.json."""
    if score <= HIGH_RISK_MAX:
        return "high"
    elif score <= MEDIUM_RISK_MAX:
        return "medium"
    else:
        return "low"


# Score -> Quyet dinh
def assign_decision(score: int) -> str:
    """TU CHOI / XEM XET / PHE DUYET dua tren risk tier."""
    if score <= HIGH_RISK_MAX:
        return "TỪ CHỐI"
    elif score <= MEDIUM_RISK_MAX:
        return "XEM XÉT"
    else:
        return "PHÊ DUYỆT"


def is_approved(score: int) -> bool:
    """True neu score vuot nguong HIGH risk -> duoc duyet hoac xem xet."""
    return score > HIGH_RISK_MAX


# Khuyen nghi hanh dong (Rule-Based Thresholds)
def generate_recommendations(
    score: int,
    risk_level: str,
    person_income: float,
    loan_amnt: float,
    other_debt: float,
    credit_utilization_ratio: float,
    past_delinquencies: int,
    cb_person_default_on_file: str,
    loan_to_income_ratio: float,
    debt_to_income_ratio: float,
    person_home_ownership: str = None,
    loan_intent: str = None,
) -> list[str]:
    """
    Sinh danh sach khuyen nghi dua tren luat nguong nghiep vu ngan hang.
    Cac nguong duoc rut ra tu phan tich EDA va best practices tin dung.
    """
    recs: list[str] = []

    # Khuyen nghi tong quat theo risk level
    if risk_level == "low":
        recs.append(
            f"Hồ sơ có điểm tín dụng tốt ({score}). Khuyến nghị PHÊ DUYỆT khoản vay."
        )
    elif risk_level == "medium":
        recs.append(
            f"Hồ sơ ở mức rủi ro trung bình ({score}). Cần xem xét thêm trước khi phê duyệt."
        )
    else:
        recs.append(
            f"Hồ sơ có rủi ro cao ({score}). Khuyến nghị TỪ CHỐI hoặc yêu cầu bổ sung tài sản đảm bảo."
        )


    # Tien su vo no
    if cb_person_default_on_file == "Y":
        recs.append(
            "Có tiền sử vỡ nợ trước đây. Đây là yếu tố rủi ro nghiêm trọng, "
            "ảnh hưởng lớn đến quyết định phê duyệt."
        )

    # So lan tre han
    if past_delinquencies > 0:
        recs.append(
            f"Lịch sử ghi nhận {past_delinquencies} lần trễ hạn thanh toán. "
            f"Vui lòng thiết lập thanh toán tự động để đảm bảo đúng hạn trong tương lai."
        )

    # Ty le vay / thu nhap
    if loan_to_income_ratio >= 0.50:
        recs.append(
            f"Tỷ lệ khoản vay/thu nhập rất cao ({loan_to_income_ratio:.1%}). "
            f"Nên giảm đáng kể số tiền đề nghị vay hoặc tăng nguồn thu nhập."
        )
    elif loan_to_income_ratio >= 0.30:
        recs.append(
            f"Tỷ lệ khoản vay/thu nhập khá cao ({loan_to_income_ratio:.1%}). "
            f"Cân nhắc kéo dài thời hạn vay hoặc giảm số tiền vay."
        )

    # Ty le no / thu nhap (DTI)
    if debt_to_income_ratio >= 0.60:
        recs.append(
            f"Tổng nợ trên thu nhập ở mức báo động ({debt_to_income_ratio:.1%}). "
            f"Nên giảm bớt các khoản nợ tiêu dùng khác trước khi nộp đơn vay mới."
        )
    elif debt_to_income_ratio >= 0.40:
        recs.append(
            f"Tổng nợ trên thu nhập ở mức cao ({debt_to_income_ratio:.1%}). "
            f"Giảm DTI dưới 40% sẽ cải thiện khả năng được phê duyệt."
        )

    # Tinh trang nha o (person_home_ownership)
    if person_home_ownership:
        home_upper = person_home_ownership.upper()
        if home_upper == "RENT":
            recs.append("Khách hàng hiện đang thuê nhà, chưa có tài sản đảm bảo vững chắc. Khuyến nghị bổ sung tài sản thế chấp hoặc người bảo lãnh để giảm thiểu rủi ro.")
        elif home_upper == "OWN":
            recs.append("Khách hàng có tài sản đảm bảo. Khuyến nghị ưu tiên phê duyệt nhanh hoặc áp dụng chính sách ưu đãi hạn mức.")

    # Muc dich vay (loan_intent)
    if loan_intent:
        intent_upper = loan_intent.upper()
        if intent_upper in ["DEBTCONSOLIDATION", "HOMEIMPROVEMENT", "MEDICAL"]:
            recs.append("Mục đích sử dụng có rủi ro, cần kiểm soát chặt chẽ (Cơ cấu nợ/Sửa nhà/Y tế). Yêu cầu bổ sung chứng từ chứng minh phương án sử dụng vốn; cân nhắc áp dụng biên độ lãi suất bổ sung hoặc tài sản bảo đảm.")
        elif intent_upper in ["VENTURE", "EDUCATION"]:
            recs.append("Mục đích sử dụng tốt và có tạo ra lợi nhuận. Khuyến nghị hỗ trợ áp dụng các gói lãi suất ưu đãi và tối ưu hóa thời gian xử lý hồ sơ.")

    return recs


# Luat cung (Business Rules)
def apply_business_rules(
    score: int,
    risk_level: str,
    decision: str,
    approved: bool,
    cb_person_default_on_file: str,
    past_delinquencies: int,
    loan_to_income_ratio: float,
    debt_to_income_ratio: float,
) -> tuple[int, str, str, bool]:
    """
    Ap dung 2 tang luat nghiep vu sau khi model da cho ket qua.

    Tang 1 - Knock-Out (tu choi thang):
        - Tien su vo no
        - Tre han >= 5 lan
        - LTI > 0.8
        - DTI > 0.6

    Tang 2 - Soft Downgrade (low -> medium):
        - Tre han > 3 lan
        - LTI > 0.3
        - DTI > 0.4
        Chi ha bac neu dang o "low". Medium/high giu nguyen.

    Tra ve: (final_score, risk_level, decision, approved)
    """

    # Tang 1: Knock-Out
    knockout = (
        (cb_person_default_on_file == "Y" and (
            past_delinquencies >= 5
            or loan_to_income_ratio >= 0.8
            or debt_to_income_ratio >= 0.6
        ))
        or (cb_person_default_on_file == "N" and (
            past_delinquencies >= 5
            or loan_to_income_ratio >= 0.8
            or debt_to_income_ratio >= 0.6
        ))
    )

    if knockout:
        final_score = min(score, 500)
        return final_score, "high", "TỪ CHỐI", False

    # Tang 2: Soft Downgrade
    soft_flag = (
        (cb_person_default_on_file == "Y" and (
            past_delinquencies >= 3
            or loan_to_income_ratio >= 0.3
            or debt_to_income_ratio >= 0.4
        ))
        or (cb_person_default_on_file == "N" and (
            past_delinquencies >= 3
            or loan_to_income_ratio >= 0.3
            or  debt_to_income_ratio >= 0.4
        ))
    )

    if soft_flag and risk_level == "low":
        return score, "medium", "XEM XÉT", True

    # Khong vi pham gi  gui nguyen
    return score, risk_level, decision, approved
