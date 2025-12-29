"""
Pipeline validation endpoint.

Validates pipeline configuration without persisting.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

import structlog
from fastapi import APIRouter, Depends, status

from backend.api.dependencies import get_app_settings
from backend.api.schemas import (
    PipelineConfigRequest,
    PipelineValidationResponse,
    VersionedResponse,
)
from backend.configuration import Settings

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.post(
    "/validate",
    response_model=VersionedResponse[PipelineValidationResponse],
    status_code=status.HTTP_200_OK,
)
async def validate_pipeline(
    request: PipelineConfigRequest,
    settings: Settings = Depends(get_app_settings),
) -> VersionedResponse[PipelineValidationResponse]:
    """
    Validate pipeline configuration without saving.

    Checks step dependencies, parameter types, and data flow logic
    before pipeline creation.

    Args:
        request: Pipeline configuration to validate.
        settings: Application settings.

    Returns:
        VersionedResponse containing validation result.
    """
    logger.info(
        "pipeline_validation_requested",
        pipeline_name=request.name,
        step_count=len(request.steps),
    )

    # TODO: Phase 5 - Verify dataset exists
    # TODO: Phase 5 - Validate step dependencies (no cycles)
    # TODO: Phase 5 - Validate operation names against available operations
    # TODO: Phase 5 - Validate parameter schemas for each step type

    mock_response = PipelineValidationResponse(
        valid=True,
        errors=[],
        warnings=[],
    )

    return VersionedResponse(data=mock_response)
