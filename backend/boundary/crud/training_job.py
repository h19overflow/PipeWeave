"""CRUD operations for TrainingJob model.

Purpose: Training job tracking operations
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, TrainingJob model
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.training_job import TrainingJob


class CRUDTrainingJob(CRUDBase[TrainingJob]):
    """CRUD operations for TrainingJob model."""

    async def get_by_pipeline(
        self,
        db: AsyncSession,
        *,
        pipeline_id: UUID
    ) -> List[TrainingJob]:
        """Get all training jobs for a pipeline.

        Args:
            db: Database session
            pipeline_id: Pipeline UUID

        Returns:
            List of training jobs
        """
        result = await db.execute(
            select(TrainingJob)
            .where(TrainingJob.pipeline_id == pipeline_id)
            .order_by(TrainingJob.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_running_jobs(
        self,
        db: AsyncSession
    ) -> List[TrainingJob]:
        """Get all currently running jobs.

        Returns:
            List of running training jobs
        """
        result = await db.execute(
            select(TrainingJob)
            .where(TrainingJob.status == "running")
        )
        return list(result.scalars().all())

    async def get_by_celery_task(
        self,
        db: AsyncSession,
        *,
        task_id: str
    ) -> Optional[TrainingJob]:
        """Get training job by Celery task ID.

        Args:
            db: Database session
            task_id: Celery task ID

        Returns:
            Training job or None
        """
        result = await db.execute(
            select(TrainingJob)
            .where(TrainingJob.celery_task_id == task_id)
        )
        return result.scalar_one_or_none()


training_job_crud = CRUDTrainingJob(TrainingJob)
