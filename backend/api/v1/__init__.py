"""
API v1 router aggregator.

Combines all domain routers into single v1 router for main app inclusion.

Layer: 2 (API)
Dependencies: fastapi, domain routers
"""

from fastapi import APIRouter

from backend.api.v1.datasets import router as datasets_router
from backend.api.v1.eda import router as eda_router
from backend.api.v1.pipelines import router as pipelines_router
from backend.api.v1.training import router as training_router

# Create v1 router
v1_router = APIRouter()

# Include domain routers
v1_router.include_router(datasets_router)
v1_router.include_router(eda_router)
v1_router.include_router(pipelines_router)
v1_router.include_router(training_router)

__all__ = ["v1_router"]
