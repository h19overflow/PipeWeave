"""Dataset upload endpoints.

Handles presigned URL generation and upload completion signaling.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import get_current_user_id, get_dataset_service
from backend.api.schemas import (
    DatasetCompleteRequest,
    DatasetResponse,
    DatasetUploadURLRequest,
    DatasetUploadURLResponse,
    VersionedResponse,
)
from backend.services.dataset import DatasetService

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.post(
    "/upload-url",
    response_model=VersionedResponse[DatasetUploadURLResponse],
    status_code=status.HTTP_201_CREATED,
)
async def request_upload_url(
    request: DatasetUploadURLRequest,
    service: DatasetService = Depends(get_dataset_service),
    user_id: UUID = Depends(get_current_user_id),
) -> VersionedResponse[DatasetUploadURLResponse]:
    """Generate presigned S3 upload URL for dataset.

    Client uses returned URL to upload file directly to S3 without
    routing data through API server.

    Args:
        request: Upload request with filename and size.
        service: Dataset service (injected).
        user_id: Current user ID (injected).

    Returns:
        VersionedResponse containing presigned URL and dataset ID.

    Raises:
        HTTPException: 400 if file size exceeds limit or invalid extension.
    """
    logger.info(
        "upload_url_requested",
        filename=request.filename,
        size_bytes=request.size_bytes,
        user_id=str(user_id),
    )

    try:
        result = await service.create_upload_url(
            user_id=user_id,
            filename=request.filename,
            file_size_bytes=request.size_bytes,
        )

        return VersionedResponse(
            data=DatasetUploadURLResponse(
                upload_url=result.upload_url,
                dataset_id=str(result.dataset_id),
                expires_at=result.expires_at,
            )
        )
    except ValueError as e:
        logger.warning(
            "upload_url_request_failed",
            error=str(e),
            user_id=str(user_id),
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/{dataset_id}/complete",
    response_model=VersionedResponse[DatasetResponse],
    status_code=status.HTTP_200_OK,
)
async def complete_upload(
    dataset_id: UUID,
    request: DatasetCompleteRequest,
    service: DatasetService = Depends(get_dataset_service),
) -> VersionedResponse[DatasetResponse]:
    """Signal that client completed S3 upload.

    Triggers backend validation and schema deduction pipeline.

    Args:
        dataset_id: Dataset UUID from upload URL request.
        request: Completion signal with file hash.
        service: Dataset service (injected).

    Returns:
        VersionedResponse containing updated dataset status.

    Raises:
        HTTPException: 400 if dataset not found or invalid state.
        HTTPException: 404 if dataset not found.
    """
    logger.info(
        "upload_completed",
        dataset_id=str(dataset_id),
        file_hash=request.file_hash[:16],
    )

    try:
        result = await service.mark_upload_complete(
            dataset_id=dataset_id,
            file_hash=request.file_hash,
        )

        return VersionedResponse(
            data=DatasetResponse(
                id=str(result.id),
                name=result.name,
                status=result.status,
                file_size_bytes=result.file_size_bytes,
                num_rows=result.num_rows,
                num_columns=result.num_columns,
                created_at=result.created_at,
            )
        )
    except ValueError as e:
        logger.warning(
            "upload_complete_failed",
            dataset_id=str(dataset_id),
            error=str(e),
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
