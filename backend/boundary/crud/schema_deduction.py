"""CRUD operations for SchemaDeduction model.

Purpose: Schema deduction operations
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, SchemaDeduction model
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.schema_deduction import SchemaDeduction


class CRUDSchemaDeduction(CRUDBase[SchemaDeduction]):
    """CRUD operations for SchemaDeduction model."""

    async def get_by_dataset(
        self,
        db: AsyncSession,
        *,
        dataset_id: UUID
    ) -> List[SchemaDeduction]:
        """Get all schema deductions for a dataset.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            List of schema deductions
        """
        result = await db.execute(
            select(SchemaDeduction)
            .where(SchemaDeduction.dataset_id == dataset_id)
            .order_by(SchemaDeduction.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_accepted(
        self,
        db: AsyncSession,
        *,
        dataset_id: UUID
    ) -> Optional[SchemaDeduction]:
        """Get accepted schema for dataset.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            Accepted schema or None
        """
        result = await db.execute(
            select(SchemaDeduction)
            .where(SchemaDeduction.dataset_id == dataset_id)
            .where(SchemaDeduction.status == "accepted")
        )
        return result.scalar_one_or_none()


schema_deduction_crud = CRUDSchemaDeduction(SchemaDeduction)
