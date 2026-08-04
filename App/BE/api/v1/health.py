"""
api/v1/health.py — System health check endpoint (no auth required).
"""
from datetime import datetime, timezone

from fastapi import APIRouter

from domain.prediction.schema import HealthResponse
from ml.model import is_loaded

router = APIRouter(tags=["System"])


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health_check():
    """Server + model status check — used by Render.com uptime monitoring."""
    return HealthResponse(
        status="ok",
        model_loaded=is_loaded(),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
