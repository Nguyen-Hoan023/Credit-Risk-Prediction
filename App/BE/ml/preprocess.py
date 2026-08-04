"""
ml/preprocess.py — Feature engineering and imputation.
Moved from preprocess.py — logic 100% unchanged.
Receives raw 16-field input → computes derived features → returns 22-column DataFrame.
"""
import json
import os
from typing import Optional

import numpy as np
import pandas as pd

_ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
with open(os.path.join(_ARTIFACT_DIR, "metadata.json"), "r") as f:
    _METADATA = json.load(f)

FEATURE_ORDER: list[str] = _METADATA["features"]


def build_feature_dataframe(
    person_age: int,
    person_income: float,
    other_debt: float,
    person_emp_length: Optional[float],
    loan_amnt: float,
    loan_int_rate: Optional[float],
    loan_term_months: int,
    cb_person_cred_hist_length: float,
    open_accounts: int,
    past_delinquencies: int,
    cb_person_default_on_file: str,
    credit_utilization_ratio: float,
    person_home_ownership: str,
    loan_intent: str,
    employment_type: str,
    education_level: str,
) -> pd.DataFrame:
    """
    Transform 16 raw user inputs → 22-feature DataFrame in the exact column order
    expected by the LightGBM pipeline (as specified in metadata.json).
    """
    # Derived numeric features
    person_income_log = np.log1p(person_income)
    other_debt_log = np.log1p(other_debt)

    safe_income = max(person_income, 1.0)
    loan_to_income_ratio = loan_amnt / safe_income
    loan_percent_income = loan_amnt / safe_income
    debt_to_income_ratio = (other_debt + loan_amnt) / safe_income

    # Missing flags
    emp_length_missing = 1 if person_emp_length is None else 0
    loan_int_rate_missing = 1 if loan_int_rate is None else 0

    emp_length_value = person_emp_length if person_emp_length is not None else np.nan
    int_rate_value = loan_int_rate if loan_int_rate is not None else np.nan

    # Conditional flags
    has_prior_default = 1 if cb_person_default_on_file == "Y" else 0
    high_loan_burden_flag = 1 if (loan_to_income_ratio > 0.30 or debt_to_income_ratio > 0.40) else 0

    row = {
        "person_age": person_age,
        "person_income_log": person_income_log,
        "other_debt_log": other_debt_log,
        "person_emp_length": emp_length_value,
        "loan_amnt": loan_amnt,
        "loan_int_rate": int_rate_value,
        "loan_term_months": loan_term_months,
        "loan_percent_income": loan_percent_income,
        "debt_to_income_ratio": debt_to_income_ratio,
        "loan_to_income_ratio": loan_to_income_ratio,
        "credit_utilization_ratio": credit_utilization_ratio,
        "cb_person_cred_hist_length": cb_person_cred_hist_length,
        "open_accounts": open_accounts,
        "has_prior_default": has_prior_default,
        "past_delinquencies": past_delinquencies,
        "emp_length_missing": emp_length_missing,
        "loan_int_rate_missing": loan_int_rate_missing,
        "high_loan_burden_flag": high_loan_burden_flag,
        "person_home_ownership": person_home_ownership,
        "loan_intent": loan_intent,
        "employment_type": employment_type,
        "education_level": education_level,
    }

    return pd.DataFrame([row], columns=FEATURE_ORDER)
