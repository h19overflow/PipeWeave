"""Pipelines API endpoints module.

Layer: 2 (API)
"""

from fastapi import APIRouter

from backend.api.v1.pipelines import mutations, query, validation

# Create combined router
router = APIRouter(prefix="/pipelines", tags=["Pipelines"])

# Include sub-routers
router.include_router(validation.router)
router.include_router(mutations.router)
router.include_router(query.router)

__all__ = ["router"]
