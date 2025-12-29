"""
Pipeline query endpoints (read operations).

Handles pipeline retrieval by ID.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

from datetime import datetime

import structlog
from fastapi import APIRouter, Depends, status

from backend.api.dependencies import get_app_settings
from backend.api.schemas import (
    PipelineResponse,
    VersionedResponse,
)
from backend.configuration import Settings

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.get(
    "/{pipeline_id}",
    response_model=VersionedResponse[PipelineResponse],
    status_code=status.HTTP_200_OK,
)
async def get_pipeline(
    pipeline_id: str,
    settings: Settings = Depends(get_app_settings),
) -> VersionedResponse[PipelineResponse]:
    """
    Retrieve pipeline details by ID.

    Args:
        pipeline_id: Pipeline UUID.
        settings: Application settings.

    Returns:
        VersionedResponse containing pipeline configuration.

    Raises:
        HTTPException: 404 if pipeline not found.
    """
    logger.info("pipeline_retrieved", pipeline_id=pipeline_id)

    # TODO: Phase 5 - Query pipeline from database
    # TODO: Phase 5 - Raise 404 if not found

    mock_response = PipelineResponse(
        id=pipeline_id,
        name="Mock Pipeline",
        dataset_id="mock-dataset-uuid",
        steps=[],
        description=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=None,
    )

    return VersionedResponse(data=mock_response)
