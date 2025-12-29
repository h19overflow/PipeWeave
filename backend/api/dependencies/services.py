"""
Service dependency providers.

Provides dataset and training service instances with injected dependencies.

Layer: 2 (API)
Dependencies: fastapi, backend.services, backend.boundary
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.dependencies.database import get_db
from backend.api.dependencies.storage import get_s3_storage
from backend.boundary.crud.dataset import dataset_crud
from backend.boundary.storage import S3Storage
from backend.services.dataset import DatasetService
from backend.services.training_service import TrainingService


async def get_dataset_service(
    db: AsyncSession = Depends(get_db),
    s3_storage: S3Storage = Depends(get_s3_storage),
) -> DatasetService:
    """
    Get dataset service with injected dependencies.

    Args:
        db: Database session (injected)
        s3_storage: S3 storage client (injected)

    Returns:
        DatasetService: Configured service instance

    Example:
        @router.post("/datasets/upload-url")
        async def create_upload(
            service: DatasetService = Depends(get_dataset_service),
        ):
            return await service.create_upload_url(...)
    """
    return DatasetService(
        db=db,
        s3_storage=s3_storage,
        dataset_crud=dataset_crud,
    )


async def get_training_service(
    db: AsyncSession = Depends(get_db),
    s3_storage: S3Storage = Depends(get_s3_storage),
) -> TrainingService:
    """
    Get training service with injected dependencies.

    Args:
        db: Database session (injected)
        s3_storage: S3 storage client (injected)

    Returns:
        TrainingService: Configured service instance

    Example:
        @router.post("/training/jobs")
        async def create_job(
            service: TrainingService = Depends(get_training_service),
        ):
            return await service.create_training_job(...)
    """
    return TrainingService(db=db, s3_storage=s3_storage)
