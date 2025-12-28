"""Dataset query endpoints.

Handles dataset retrieval and listing.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import get_current_user_id, get_dataset_service
from backend.api.schemas import (
    DatasetListItem,
    DatasetResponse,
    VersionedResponse,
)
from backend.services.dataset import DatasetService

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.get(
    "/{dataset_id}",
    response_model=VersionedResponse[DatasetResponse],
    status_code=status.HTTP_200_OK,
)
async def get_dataset(
    dataset_id: UUID,
    service: DatasetService = Depends(get_dataset_service),
) -> VersionedResponse[DatasetResponse]:
    """Retrieve dataset details by ID.

    Args:
        dataset_id: Dataset UUID.
        service: Dataset service (injected).

    Returns:
        VersionedResponse containing dataset details.

    Raises:
        HTTPException: 404 if dataset not found.
    """
    logger.info("dataset_retrieved", dataset_id=str(dataset_id))

    result = await service.get_dataset(dataset_id)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset {dataset_id} not found",
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


@router.get(
    "/",
    response_model=VersionedResponse[list[DatasetListItem]],
    status_code=status.HTTP_200_OK,
)
async def list_datasets(
    skip: int = 0,
    limit: int = 20,
    service: DatasetService = Depends(get_dataset_service),
    user_id: UUID = Depends(get_current_user_id),
) -> VersionedResponse[list[DatasetListItem]]:
    """List datasets with pagination.

    Args:
        skip: Pagination offset.
        limit: Maximum number of results (capped at 100).
        service: Dataset service (injected).
        user_id: Current user ID (injected).

    Returns:
        VersionedResponse containing dataset list.
    """
    logger.info(
        "datasets_listed",
        skip=skip,
        limit=limit,
        user_id=str(user_id),
    )

    # Cap limit at 100
    limit = min(limit, 100)

    results = await service.list_datasets(
        user_id=user_id,
        skip=skip,
        limit=limit,
    )

    return VersionedResponse(
        data=[
            DatasetListItem(
                id=str(r.id),
                name=r.name,
                status=r.status,
                created_at=r.created_at,
            )
            for r in results
        ]
    )
