"""CRUD operations for Model model.

Purpose: Trained model artifact operations
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, Model model
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.model import Model


class CRUDModel(CRUDBase[Model]):
    """CRUD operations for Model model."""

    async def get_by_training_job(
        self,
        db: AsyncSession,
        *,
        training_job_id: UUID
    ) -> Optional[Model]:
        """Get model by training job.

        Args:
            db: Database session
            training_job_id: Training job UUID

        Returns:
            Model or None
        """
        result = await db.execute(
            select(Model)
            .where(Model.training_job_id == training_job_id)
        )
        return result.scalar_one_or_none()

    async def get_production_models(
        self,
        db: AsyncSession,
        *,
        user_id: UUID
    ) -> List[Model]:
        """Get all production models for user.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            List of production models
        """
        result = await db.execute(
            select(Model)
            .where(Model.user_id == user_id)
            .where(Model.is_production == True)
            .order_by(Model.deployed_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_pipeline(
        self,
        db: AsyncSession,
        *,
        pipeline_id: UUID
    ) -> List[Model]:
        """Get all models for a pipeline.

        Args:
            db: Database session
            pipeline_id: Pipeline UUID

        Returns:
            List of models
        """
        result = await db.execute(
            select(Model)
            .where(Model.pipeline_id == pipeline_id)
            .order_by(Model.created_at.desc())
        )
        return list(result.scalars().all())


model_crud = CRUDModel(Model)
