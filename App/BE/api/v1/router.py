"""
api/v1/router.py — Aggregates all v1 routers into a single include.
"""
from fastapi import APIRouter

from api.v1 import auth, health, predictions, users, admin

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(predictions.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)
