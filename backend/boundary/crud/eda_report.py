"""CRUD operations for EDAReport model.

Purpose: EDA report operations with hybrid storage
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, EDAReport model
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.eda_report import EDAReport


class CRUDEDAReport(CRUDBase[EDAReport]):
    """CRUD operations for EDAReport model."""

    async def get_by_dataset(
        self,
        db: AsyncSession,
        *,
        dataset_id: UUID
    ) -> List[EDAReport]:
        """Get all EDA reports for a dataset.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            List of EDA reports
        """
        result = await db.execute(
            select(EDAReport)
            .where(EDAReport.dataset_id == dataset_id)
            .order_by(EDAReport.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_latest(
        self,
        db: AsyncSession,
        *,
        dataset_id: UUID
    ) -> Optional[EDAReport]:
        """Get latest completed EDA report for dataset.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            Latest report or None
        """
        result = await db.execute(
            select(EDAReport)
            .where(EDAReport.dataset_id == dataset_id)
            .where(EDAReport.status == "completed")
            .order_by(EDAReport.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


eda_report_crud = CRUDEDAReport(EDAReport)
