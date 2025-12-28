"""CRUD operations for Dataset model.

Purpose: Dataset-specific operations with S3 file references
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, Dataset model, SQLAlchemy
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.dataset import Dataset


class CRUDDataset(CRUDBase[Dataset]):
    """CRUD operations for Dataset model."""

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dataset]:
        """Get all datasets for a user (excludes soft-deleted).

        Args:
            db: Database session
            user_id: User UUID
            skip: Pagination offset
            limit: Max records

        Returns:
            List of datasets
        """
        result = await db.execute(
            select(Dataset)
            .where(Dataset.user_id == user_id)
            .where(Dataset.deleted_at == None)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_hash(
        self,
        db: AsyncSession,
        *,
        file_hash: str
    ) -> Optional[Dataset]:
        """Get dataset by file hash (for deduplication).

        Args:
            db: Database session
            file_hash: SHA-256 file hash

        Returns:
            Dataset or None
        """
        result = await db.execute(
            select(Dataset)
            .where(Dataset.file_hash_sha256 == file_hash)
            .where(Dataset.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def get_by_status(
        self,
        db: AsyncSession,
        *,
        status: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dataset]:
        """Get datasets by processing status.

        Args:
            db: Database session
            status: Dataset status (uploading, uploaded, etc.)
            skip: Pagination offset
            limit: Max records

        Returns:
            List of datasets
        """
        result = await db.execute(
            select(Dataset)
            .where(Dataset.status == status)
            .where(Dataset.deleted_at == None)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def soft_delete(
        self,
        db: AsyncSession,
        *,
        id: UUID
    ) -> Optional[Dataset]:
        """Soft delete dataset.

        Args:
            db: Database session
            id: Dataset UUID

        Returns:
            Updated dataset or None if not found
        """
        dataset = await self.get(db, id=id)
        if dataset:
            dataset.soft_delete()
            await db.commit()
            await db.refresh(dataset)
        return dataset


# Singleton instance
dataset_crud = CRUDDataset(Dataset)
