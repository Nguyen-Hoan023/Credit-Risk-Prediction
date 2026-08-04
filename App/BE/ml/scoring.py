"""
ml/scoring.py — Convert PD → Credit Score (Log-Odds) → Risk Tier → Decision.
Generates action recommendations and applies hard business rules.
Moved from scoring.py — logic 100% unchanged.

I18N: All output codes are standard English (APPROVE/REVIEW/REJECT, reason codes).
Frontend translates these codes to vi/en.
"""
import json
import os

import numpy as np

_ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
with open(os.path.join(_ARTIFACT_DIR, "metadata.json"), "r") as f:
    _METADATA = json.load(f)

SCORE_MIN: int = _METADATA["score_min"]
SCORE_MAX: int = _METADATA["score_max"]
PDO: int = _METADATA["pdo"]
BASE_SCORE: int = _METADATA["base_score"]
HIGH_RISK_MAX: int = _METADATA["band_config"]["high_risk_max"]
MEDIUM_RISK_MAX: int = _METADATA["band_config"]["medium_risk_max"]


def prob_to_score(prob: float) -> int:
    """Convert probability of default → credit score 300–850 using Log-Odds formula."""
    prob = float(np.clip(prob, 1e-6, 1 - 1e-6))
    factor = PDO / np.log(2)
    offset = BASE_SCORE
    odds = (1 - prob) / prob
    score = offset + factor * np.log(odds)
    return int(np.clip(score, SCORE_MIN, SCORE_MAX))


def assign_risk_tier(score: int) -> str:
    """Return 'high' / 'medium' / 'low' based on band_config thresholds."""
    if score <= HIGH_RISK_MAX:
        return "high"
    elif score <= MEDIUM_RISK_MAX:
        return "medium"
    return "low"


def assign_decision(score: int) -> str:
    """Return 'REJECT' / 'REVIEW' / 'APPROVE' based on risk tier."""
    if score <= HIGH_RISK_MAX:
        return "REJECT"
    elif score <= MEDIUM_RISK_MAX:
        return "REVIEW"
    return "APPROVE"


def is_approved(score: int) -> bool:
    return score > HIGH_RISK_MAX


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
    Generate action recommendations based on banking business rule thresholds.
    Returns list of {code, params} objects — frontend translates to vi/en.
    """
    recs: list[dict] = []

    # Overall risk assessment
    if risk_level == "low":
        recs.append({"code": "GOOD_SCORE", "params": {"score": score}})
    elif risk_level == "medium":
        recs.append({"code": "MEDIUM_SCORE", "params": {"score": score}})
    else:
        recs.append({"code": "HIGH_RISK_SCORE", "params": {"score": score}})

    # Prior default history
    if cb_person_default_on_file == "Y":
        recs.append({"code": "PRIOR_DEFAULT", "params": {}})

    # Delinquency history
    if past_delinquencies > 0:
        recs.append({"code": "PAST_DELINQUENCIES", "params": {"count": past_delinquencies}})

    # Loan-to-income ratio
    if loan_to_income_ratio >= 0.50:
        recs.append({"code": "VERY_HIGH_LTI", "params": {"ratio": f"{loan_to_income_ratio:.1%}"}})
    elif loan_to_income_ratio >= 0.30:
        recs.append({"code": "HIGH_LTI", "params": {"ratio": f"{loan_to_income_ratio:.1%}"}})

    # Debt-to-income ratio
    if debt_to_income_ratio >= 0.60:
        recs.append({"code": "CRITICAL_DTI", "params": {"ratio": f"{debt_to_income_ratio:.1%}"}})
    elif debt_to_income_ratio >= 0.40:
        recs.append({"code": "HIGH_DTI", "params": {"ratio": f"{debt_to_income_ratio:.1%}"}})

    # Home ownership
    if person_home_ownership:
        upper = person_home_ownership.upper()
        if upper == "RENT":
            recs.append({"code": "RENTER_NO_COLLATERAL", "params": {}})
        elif upper == "OWN":
            recs.append({"code": "OWNER_HAS_COLLATERAL", "params": {}})

    # Loan intent
    if loan_intent:
        upper = loan_intent.upper()
        if upper in ["DEBTCONSOLIDATION", "HOMEIMPROVEMENT", "MEDICAL"]:
            recs.append({"code": "RISKY_LOAN_PURPOSE", "params": {}})
        elif upper in ["VENTURE", "EDUCATION"]:
            recs.append({"code": "GOOD_LOAN_PURPOSE", "params": {}})

    # Outlier flags (EDA-derived IQR upper bounds)
    if person_income > 150000:
        recs.append({"code": "HIGH_INCOME_FLAG", "params": {"value": f"{person_income:,.0f}"}})
    if loan_amnt > 25000:
        recs.append({"code": "HIGH_LOAN_AMOUNT_FLAG", "params": {"value": f"{loan_amnt:,.0f}"}})
    if other_debt > 30000:
        recs.append({"code": "HIGH_OTHER_DEBT_FLAG", "params": {"value": f"{other_debt:,.0f}"}})

    return recs


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
    Apply two-tier hard business rules after model prediction.

    Tier 1 — Knock-Out (immediate REJECT):
        - past_delinquencies >= 5, OR LTI >= 0.8, OR DTI >= 0.6

    Tier 2 — Soft Downgrade (low → medium):
        - past_delinquencies >= 3, OR LTI >= 0.3, OR DTI >= 0.4
        - Only downgrades 'low' risk, medium/high unchanged.

    Returns: (final_score, risk_level, decision, approved)
    """
    knockout = (
        past_delinquencies >= 5
        or loan_to_income_ratio >= 0.8
        or debt_to_income_ratio >= 0.6
    )

    if knockout:
        return min(score, 500), "high", "REJECT", False

    soft_flag = (
        past_delinquencies >= 3
        or loan_to_income_ratio >= 0.3
        or debt_to_income_ratio >= 0.4
    )

    if soft_flag and risk_level == "low":
        return score, "medium", "REVIEW", True

    return score, risk_level, decision, approved
