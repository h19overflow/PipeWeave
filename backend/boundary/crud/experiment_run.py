"""CRUD operations for ExperimentRun model.

Purpose: Experiment run tracking operations
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, ExperimentRun model
"""

from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.experiment_run import ExperimentRun


class CRUDExperimentRun(CRUDBase[ExperimentRun]):
    """CRUD operations for ExperimentRun model."""

    async def get_by_training_job(
        self,
        db: AsyncSession,
        *,
        training_job_id: UUID
    ) -> List[ExperimentRun]:
        """Get all experiment runs for a training job.

        Args:
            db: Database session
            training_job_id: Training job UUID

        Returns:
            List of experiment runs
        """
        result = await db.execute(
            select(ExperimentRun)
            .where(ExperimentRun.training_job_id == training_job_id)
            .order_by(ExperimentRun.run_number)
        )
        return list(result.scalars().all())

    async def get_completed(
        self,
        db: AsyncSession,
        *,
        training_job_id: UUID
    ) -> List[ExperimentRun]:
        """Get completed experiment runs.

        Args:
            db: Database session
            training_job_id: Training job UUID

        Returns:
            List of completed runs
        """
        result = await db.execute(
            select(ExperimentRun)
            .where(ExperimentRun.training_job_id == training_job_id)
            .where(ExperimentRun.status == "completed")
            .order_by(ExperimentRun.run_number)
        )
        return list(result.scalars().all())


experiment_run_crud = CRUDExperimentRun(ExperimentRun)
