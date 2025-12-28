"""CRUD operations for Pipeline model.

Purpose: Pipeline configuration operations
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, Pipeline model
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.pipeline import Pipeline


class CRUDPipeline(CRUDBase[Pipeline]):
    """CRUD operations for Pipeline model."""

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Pipeline]:
        """Get all pipelines for a user (excludes soft-deleted).

        Args:
            db: Database session
            user_id: User UUID
            skip: Pagination offset
            limit: Max records

        Returns:
            List of pipelines
        """
        result = await db.execute(
            select(Pipeline)
            .where(Pipeline.user_id == user_id)
            .where(Pipeline.deleted_at == None)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_validated(
        self,
        db: AsyncSession,
        *,
        user_id: UUID
    ) -> List[Pipeline]:
        """Get validated pipelines for user.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            List of validated pipelines
        """
        result = await db.execute(
            select(Pipeline)
            .where(Pipeline.user_id == user_id)
            .where(Pipeline.status == "validated")
            .where(Pipeline.deleted_at == None)
        )
        return list(result.scalars().all())

    async def soft_delete(
        self,
        db: AsyncSession,
        *,
        id: UUID
    ) -> Optional[Pipeline]:
        """Soft delete pipeline.

        Args:
            db: Database session
            id: Pipeline UUID

        Returns:
            Updated pipeline or None
        """
        pipeline = await self.get(db, id=id)
        if pipeline:
            pipeline.soft_delete()
            await db.commit()
            await db.refresh(pipeline)
        return pipeline


pipeline_crud = CRUDPipeline(Pipeline)
