"""Base CRUD operations for database models.

Purpose: Generic CRUD interface for all database models
Layer: Boundary (I/O Gateway)
Dependencies: SQLAlchemy async session, typing generics
"""

from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from backend.boundary.models.base import Base


ModelType = TypeVar("ModelType", bound=Base)


class CRUDBase(Generic[ModelType]):
    """Base class for CRUD operations.

    Provides generic create, read, update, delete operations for any SQLAlchemy model.
    All operations are async and use dependency injection for database sessions.
    """

    def __init__(self, model: Type[ModelType]):
        """Initialize CRUD with model class.

        Args:
            model: SQLAlchemy model class
        """
        self.model = model

    async def create(
        self,
        db: AsyncSession,
        *,
        obj_in: Dict[str, Any]
    ) -> ModelType:
        """Create new database record.

        Args:
            db: Database session
            obj_in: Dictionary of model attributes

        Returns:
            Created model instance

        Raises:
            IntegrityError: If unique constraints violated
        """
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get(
        self,
        db: AsyncSession,
        *,
        id: UUID
    ) -> Optional[ModelType]:
        """Get record by ID.

        Args:
            db: Database session
            id: Record UUID

        Returns:
            Model instance or None if not found
        """
        result = await db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """Get multiple records with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum records to return

        Returns:
            List of model instances
        """
        result = await db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def update(
        self,
        db: AsyncSession,
        *,
        id: UUID,
        obj_in: Dict[str, Any]
    ) -> Optional[ModelType]:
        """Update record by ID.

        Args:
            db: Database session
            id: Record UUID
            obj_in: Dictionary of attributes to update

        Returns:
            Updated model instance or None if not found
        """
        await db.execute(
            update(self.model)
            .where(self.model.id == id)
            .values(**obj_in)
        )
        await db.commit()
        return await self.get(db, id=id)

    async def delete(
        self,
        db: AsyncSession,
        *,
        id: UUID
    ) -> bool:
        """Hard delete record by ID.

        Args:
            db: Database session
            id: Record UUID

        Returns:
            True if deleted, False if not found
        """
        result = await db.execute(
            delete(self.model).where(self.model.id == id)
        )
        await db.commit()
        return result.rowcount > 0

    def _build_query(self, **filters) -> Select:
        """Build SELECT query with filters.

        Args:
            **filters: Field name to value mappings

        Returns:
            SQLAlchemy Select statement
        """
        query = select(self.model)
        for field, value in filters.items():
            if hasattr(self.model, field):
                query = query.where(getattr(self.model, field) == value)
        return query
