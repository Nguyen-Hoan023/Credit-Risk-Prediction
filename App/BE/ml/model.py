"""
ml/model.py — Load LightGBM pipeline at startup, expose predict_proba.
Moved from model.py — logic unchanged.
Pipeline (lgbm_pipeline.pkl) includes: imputer → caster → classifier.
Artifacts are loaded once at startup, never reloaded per-request.
"""
import os

import joblib
import pandas as pd

# Import custom transformers so joblib.load can find the classes
from ml.preprocessors import CategoricalCaster, GroupMedianImputer  # noqa: F401

_ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
_PIPELINE_PATH = os.path.join(_ARTIFACT_DIR, "lgbm_pipeline.pkl")

_pipeline = None


def load_artifacts() -> None:
    """Load LightGBM pipeline from .pkl — called once in lifespan startup."""
    global _pipeline
    print(f"[ml/model.py] Loading LightGBM pipeline from {_PIPELINE_PATH} ...")
    _pipeline = joblib.load(_PIPELINE_PATH)
    print("[ml/model.py] Pipeline loaded successfully.")


def get_pipeline():
    """Return the loaded pipeline. Raises if not yet loaded."""
    if _pipeline is None:
        raise RuntimeError("Pipeline not loaded. Call load_artifacts() first.")
    return _pipeline


def is_loaded() -> bool:
    """Check if the pipeline is ready."""
    return _pipeline is not None


def predict_proba(df: pd.DataFrame) -> float:
    """
    Predict probability of default for a single application.

    Args:
        df: Single-row DataFrame with 22 features (may contain NaN).

    Returns:
        float: Probability of default in [0.0, 1.0].
    """
    pipeline = get_pipeline()
    proba = pipeline.predict_proba(df)[:, 1]
    return float(proba[0])
