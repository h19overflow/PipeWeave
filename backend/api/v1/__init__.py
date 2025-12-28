"""
API v1 router aggregator.

Combines all domain routers into single v1 router for main app inclusion.

Layer: 2 (API)
Dependencies: fastapi, domain routers
"""

from fastapi import APIRouter

from backend.api.v1.datasets import router as datasets_router

# Create v1 router
v1_router = APIRouter()

# Include domain routers
v1_router.include_router(datasets_router)
# TODO: Uncomment when services are implemented
# v1_router.include_router(eda.router)
# v1_router.include_router(pipelines.router)
# v1_router.include_router(training.router)

__all__ = ["v1_router"]
