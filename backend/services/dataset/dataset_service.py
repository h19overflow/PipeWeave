"""Dataset service implementation.

Purpose: Orchestrate dataset upload, validation, and lifecycle operations
Layer: Services (Business Logic Orchestration)
Dependencies: AsyncSession, S3Storage, dataset_crud
"""

from datetime import datetime, timedelta
from typing import Any, Dict
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.dataset import dataset_crud
from backend.boundary.models.dataset import Dataset
from backend.boundary.storage import S3Storage
from backend.services.dataset.validators import DatasetValidator


class DatasetService:
    """Manage dataset operations and lifecycle.

    Coordinates boundary layer (CRUD, S3Storage) for dataset workflows.
    """

    def __init__(self, session: AsyncSession, s3_storage: S3Storage):
        """Initialize service with dependencies.

        Args:
            session: SQLAlchemy async session
            s3_storage: S3 storage client
        """
        self.session = session
        self.s3_storage = s3_storage
        self.validator = DatasetValidator()

    async def create_dataset(
        self, user_id: UUID, filename: str, file_size_bytes: int
    ) -> Dataset:
        """Create new dataset record with uploading status.

        Args:
            user_id: User UUID
            filename: Original filename
            file_size_bytes: File size in bytes

        Returns:
            Created Dataset instance

        Raises:
            ValueError: If validation fails
        """
        self.validator.validate_create_inputs(filename, file_size_bytes)

        dataset_data = {
            "user_id": user_id,
            "name": filename,
            "s3_bucket": self.s3_storage.bucket_name,
            "s3_key_raw": "",
            "file_size_bytes": file_size_bytes,
            "file_hash_sha256": "",
            "status": "uploading",
        }

        dataset = await dataset_crud.create(self.session, obj_in=dataset_data)

        s3_key = f"datasets/{user_id}/{dataset.id}/raw/{filename}"
        dataset = await dataset_crud.update(
            self.session, id=dataset.id, obj_in={"s3_key_raw": s3_key}
        )

        return dataset

    async def get_upload_url(
        self, dataset_id: UUID, content_type: str = "text/csv"
    ) -> Dict[str, Any]:
        """Generate presigned S3 upload URL.

        Args:
            dataset_id: Dataset UUID
            content_type: MIME type

        Returns:
            Dict with dataset_id, upload_url, expires_at

        Raises:
            ValueError: If dataset invalid
            RuntimeError: If S3 operation fails
        """
        dataset = await dataset_crud.get(self.session, id=dataset_id)
        self.validator.validate_upload_url_request(dataset, dataset_id)

        expiration = 300
        upload_url = self.s3_storage.generate_presigned_upload_url(
            s3_key=dataset.s3_key_raw,
            expiration=expiration,
            content_type=content_type,
        )

        if not upload_url:
            raise RuntimeError("Failed to generate presigned upload URL")

        return {
            "dataset_id": str(dataset_id),
            "upload_url": upload_url,
            "expires_at": datetime.utcnow() + timedelta(seconds=expiration),
        }

    async def complete_upload(self, dataset_id: UUID) -> Dataset:
        """Mark upload complete and update status.

        Args:
            dataset_id: Dataset UUID

        Returns:
            Updated Dataset with status='uploaded'

        Raises:
            ValueError: If dataset invalid
        """
        dataset = await dataset_crud.get(self.session, id=dataset_id)
        self.validator.validate_status_transition(dataset, dataset_id, "uploading")

        return await dataset_crud.update(
            self.session, id=dataset_id, obj_in={"status": "uploaded"}
        )

    async def delete_dataset(self, dataset_id: UUID) -> None:
        """Delete dataset and S3 files.

        Args:
            dataset_id: Dataset UUID

        Raises:
            ValueError: If dataset not found
            RuntimeError: If S3 deletion fails
        """
        dataset = await dataset_crud.get(self.session, id=dataset_id)
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")

        await dataset_crud.soft_delete(self.session, id=dataset_id)

        try:
            await self.s3_storage.delete_file(dataset.s3_key_raw)
            if dataset.s3_key_processed:
                await self.s3_storage.delete_file(dataset.s3_key_processed)
        except Exception as e:
            raise RuntimeError(f"Failed to delete S3 files: {e}")
