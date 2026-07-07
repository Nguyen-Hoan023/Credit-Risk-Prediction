"""
preprocessors.py — Custom sklearn transformers dùng trong pipeline.
File này PHẢI tồn tại ở backend để joblib.load(lgbm_pipeline.pkl) tìm được class.
"""

import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class GroupMedianImputer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        self.emp_length_median_ = X.groupby("employment_type")["person_emp_length"].median()
        self.int_rate_median_   = X.groupby("loan_intent")["loan_int_rate"].median()
        self.emp_length_global_ = X["person_emp_length"].median()
        self.int_rate_global_   = X["loan_int_rate"].median()
        return self

    def transform(self, X):
        X = X.copy()
        X["person_emp_length"] = (
            X["person_emp_length"]
            .fillna(X["employment_type"].map(self.emp_length_median_))
            .fillna(self.emp_length_global_)
        )
        X["loan_int_rate"] = (
            X["loan_int_rate"]
            .fillna(X["loan_intent"].map(self.int_rate_median_))
            .fillna(self.int_rate_global_)
        )
        return X


class CategoricalCaster(BaseEstimator, TransformerMixin):
    def __init__(self, cols):
        self.cols = cols

    def fit(self, X, y=None):
        # Học và lưu thứ tự categories từ train
        self.categories_ = {}
        for col in self.cols:
            self.categories_[col] = (
                X[col].astype("category").cat.categories.tolist()
            )
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.cols:
            X[col] = pd.Categorical(
                X[col],
                categories=self.categories_[col]
            )
        return X
