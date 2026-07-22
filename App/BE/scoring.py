"""
scoring.py -- Chuyen doi xac suat vo no -> Credit Score (Log-Odds) -> Risk Tier
va sinh khuyen nghi hanh dong theo luat nguong nghiep vu ngan hang.

I18N: Tat ca output deu la ma chuan tieng Anh (APPROVE/REVIEW/REJECT, reason codes).
Frontend se dich cac ma nay sang ngon ngu tuong ung (vi/en).
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


# Score -> Quyet dinh (I18N: tra ve ma chuan tieng Anh)
def assign_decision(score: int) -> str:
    """REJECT / REVIEW / APPROVE dua tren risk tier."""
    if score <= HIGH_RISK_MAX:
        return "REJECT"
    elif score <= MEDIUM_RISK_MAX:
        return "REVIEW"
    else:
        return "APPROVE"


def is_approved(score: int) -> bool:
    """True neu score vuot nguong HIGH risk -> duoc duyet hoac xem xet."""
    return score > HIGH_RISK_MAX


# Khuyen nghi hanh dong (Rule-Based Thresholds)
# I18N: Tra ve danh sach reason code objects thay vi chuoi text tieng Viet.
# Frontend se dich cac ma nay sang ngon ngu tuong ung.
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
) -> list[dict]:
    """
    Sinh danh sach khuyen nghi dua tren luat nguong nghiep vu ngan hang.
    Cac nguong duoc rut ra tu phan tich EDA va best practices tin dung.

    Tra ve list of dict: [{"code": "REASON_CODE", "params": {"key": "value"}}]
    """
    recs: list[dict] = []

    # Khuyen nghi tong quat theo risk level
    if risk_level == "low":
        recs.append({
            "code": "GOOD_SCORE",
            "params": {"score": score}
        })
    elif risk_level == "medium":
        recs.append({
            "code": "MEDIUM_SCORE",
            "params": {"score": score}
        })
    else:
        recs.append({
            "code": "HIGH_RISK_SCORE",
            "params": {"score": score}
        })

    # Tien su vo no
    if cb_person_default_on_file == "Y":
        recs.append({
            "code": "PRIOR_DEFAULT",
            "params": {}
        })

    # So lan tre han
    if past_delinquencies > 0:
        recs.append({
            "code": "PAST_DELINQUENCIES",
            "params": {"count": past_delinquencies}
        })

    # Ty le vay / thu nhap
    if loan_to_income_ratio >= 0.50:
        recs.append({
            "code": "VERY_HIGH_LTI",
            "params": {"ratio": f"{loan_to_income_ratio:.1%}"}
        })
    elif loan_to_income_ratio >= 0.30:
        recs.append({
            "code": "HIGH_LTI",
            "params": {"ratio": f"{loan_to_income_ratio:.1%}"}
        })

    # Ty le no / thu nhap (DTI)
    if debt_to_income_ratio >= 0.60:
        recs.append({
            "code": "CRITICAL_DTI",
            "params": {"ratio": f"{debt_to_income_ratio:.1%}"}
        })
    elif debt_to_income_ratio >= 0.40:
        recs.append({
            "code": "HIGH_DTI",
            "params": {"ratio": f"{debt_to_income_ratio:.1%}"}
        })

    # Tinh trang nha o (person_home_ownership)
    if person_home_ownership:
        home_upper = person_home_ownership.upper()
        if home_upper == "RENT":
            recs.append({
                "code": "RENTER_NO_COLLATERAL",
                "params": {}
            })
        elif home_upper == "OWN":
            recs.append({
                "code": "OWNER_HAS_COLLATERAL",
                "params": {}
            })

    # Muc dich vay (loan_intent)
    if loan_intent:
        intent_upper = loan_intent.upper()
        if intent_upper in ["DEBTCONSOLIDATION", "HOMEIMPROVEMENT", "MEDICAL"]:
            recs.append({
                "code": "RISKY_LOAN_PURPOSE",
                "params": {}
            })
        elif intent_upper in ["VENTURE", "EDUCATION"]:
            recs.append({
                "code": "GOOD_LOAN_PURPOSE",
                "params": {}
            })

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
        return final_score, "high", "REJECT", False

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
        return score, "medium", "REVIEW", True

    # Khong vi pham gi  gui nguyen
    return score, risk_level, decision, approved
