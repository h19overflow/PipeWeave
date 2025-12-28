"""
ML Pipeline API endpoints (v1).

Handles pipeline creation, validation, retrieval, and deletion.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

from datetime import datetime

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import get_app_settings
from backend.api.schemas import (
    PipelineConfigRequest,
    PipelineResponse,
    PipelineValidationResponse,
    VersionedResponse,
)
from backend.configuration import Settings

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/pipelines", tags=["Pipelines"])


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


@router.post(
    "/",
    response_model=VersionedResponse[PipelineResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_pipeline(
    request: PipelineConfigRequest,
    settings: Settings = Depends(get_app_settings),
) -> VersionedResponse[PipelineResponse]:
    """
    Create new ML pipeline.

    Validates configuration and persists pipeline to database.

    Args:
        request: Pipeline configuration.
        settings: Application settings.

    Returns:
        VersionedResponse containing created pipeline with ID.

    Raises:
        HTTPException: 400 if validation fails, 404 if dataset not found.
    """
    logger.info(
        "pipeline_creation_requested",
        pipeline_name=request.name,
        dataset_id=request.dataset_id,
    )

    # TODO: Phase 5 - Validate pipeline via validation service
    # TODO: Phase 5 - Create pipeline record in database
    # TODO: Phase 5 - Return 400 if validation fails

    mock_response = PipelineResponse(
        id="mock-pipeline-uuid-123",
        name=request.name,
        dataset_id=request.dataset_id,
        steps=request.steps,
        description=request.description,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=None,
    )

    return VersionedResponse(data=mock_response)


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


@router.put(
    "/{pipeline_id}",
    response_model=VersionedResponse[PipelineResponse],
    status_code=status.HTTP_200_OK,
)
async def update_pipeline(
    pipeline_id: str,
    request: PipelineConfigRequest,
    settings: Settings = Depends(get_app_settings),
) -> VersionedResponse[PipelineResponse]:
    """
    Update existing pipeline configuration.

    Validates new configuration before applying changes.

    Args:
        pipeline_id: Pipeline UUID to update.
        request: New pipeline configuration.
        settings: Application settings.

    Returns:
        VersionedResponse containing updated pipeline.

    Raises:
        HTTPException: 404 if pipeline not found, 400 if validation fails.
    """
    logger.info(
        "pipeline_update_requested",
        pipeline_id=pipeline_id,
        new_name=request.name,
    )

    # TODO: Phase 5 - Verify pipeline exists
    # TODO: Phase 5 - Validate new configuration
    # TODO: Phase 5 - Update pipeline in database

    mock_response = PipelineResponse(
        id=pipeline_id,
        name=request.name,
        dataset_id=request.dataset_id,
        steps=request.steps,
        description=request.description,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=None,
    )

    return VersionedResponse(data=mock_response)


@router.delete(
    "/{pipeline_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_pipeline(
    pipeline_id: str,
    settings: Settings = Depends(get_app_settings),
) -> None:
    """
    Soft delete pipeline.

    Marks pipeline as deleted without removing from database.
    Prevents deletion if active training jobs reference this pipeline.

    Args:
        pipeline_id: Pipeline UUID to delete.
        settings: Application settings.

    Raises:
        HTTPException: 404 if not found, 409 if active jobs exist.
    """
    logger.info("pipeline_deletion_requested", pipeline_id=pipeline_id)

    # TODO: Phase 5 - Verify pipeline exists
    # TODO: Phase 5 - Check for active training jobs
    # TODO: Phase 5 - Soft delete (set deleted_at timestamp)

    return None
