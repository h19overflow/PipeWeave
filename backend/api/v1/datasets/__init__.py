"""Dataset API endpoints module.

Combines upload and query endpoints into a single router.

Layer: 2 (API)

Backward Compatibility:
- Combined router exposed as 'router' for main app inclusion
- All endpoint paths remain unchanged
"""

from fastapi import APIRouter

from backend.api.v1.datasets import upload, query


# Create combined router
router = APIRouter(prefix="/datasets", tags=["Datasets"])

# Include sub-routers
router.include_router(upload.router)
router.include_router(query.router)


__all__ = ["router"]
