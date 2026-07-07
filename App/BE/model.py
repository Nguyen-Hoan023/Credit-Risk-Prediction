"""
model.py — Load pipeline lúc startup, predict trả về probability.
Pipeline (lgbm_pipeline.pkl) đã gộp 3 bước: imputer → caster → classifier.
Artifacts được load 1 lần duy nhất, không load lại mỗi request.
"""

import os
import joblib
import pandas as pd

# Import custom transformers để joblib.load nhận diện được class
from preprocessors import GroupMedianImputer, CategoricalCaster  # noqa: F401

# Đường dẫn artifacts
_ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
_PIPELINE_PATH = os.path.join(_ARTIFACT_DIR, "lgbm_pipeline.pkl")

# Global reference — sẽ được gán khi load_artifacts() chạy
_pipeline = None


def load_artifacts():
    """
    Load pipeline LightGBM từ file .pkl.
    Gọi 1 lần duy nhất trong lifespan startup.
    """
    global _pipeline

    print(f"[model.py] Loading LightGBM pipeline from {_PIPELINE_PATH} ...")
    _pipeline = joblib.load(_PIPELINE_PATH)
    print(f"[model.py] Pipeline loaded successfully.")


def get_pipeline():
    """Trả về pipeline đã load."""
    if _pipeline is None:
        raise RuntimeError("Pipeline chưa được load. Hãy gọi load_artifacts() trước.")
    return _pipeline


def is_loaded() -> bool:
    """Kiểm tra pipeline đã sẵn sàng chưa."""
    return _pipeline is not None


def predict_proba(df: pd.DataFrame) -> float:
    """
    Predict probability of default cho 1 hồ sơ.
    Input: DataFrame 1 dòng với 22 features (có thể còn NaN).
    Output: Xác suất vỡ nợ (probability of default), float [0, 1].

    Pipeline tự động xử lý: impute → cast → predict.
    """
    pipeline = get_pipeline()

    # predict_proba trả về array 2D: [[P(class=0), P(class=1)]]
    # Class 1 = default → lấy cột 1
    proba = pipeline.predict_proba(df)[:, 1]

    return float(proba[0])
