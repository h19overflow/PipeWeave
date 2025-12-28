"""CRUD operations for User model.

Purpose: User-specific database operations (authentication, authorization)
Layer: Boundary (I/O Gateway)
Dependencies: CRUDBase, User model, SQLAlchemy
"""

from typing import Optional
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.base import CRUDBase
from backend.boundary.models.user import User


class CRUDUser(CRUDBase[User]):
    """CRUD operations for User model."""

    async def get_by_email(
        self,
        db: AsyncSession,
        *,
        email: str
    ) -> Optional[User]:
        """Get user by email address.

        Args:
            db: Database session
            email: User email

        Returns:
            User instance or None if not found
        """
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_active_by_email(
        self,
        db: AsyncSession,
        *,
        email: str
    ) -> Optional[User]:
        """Get active user by email (excludes soft-deleted).

        Args:
            db: Database session
            email: User email

        Returns:
            Active user or None
        """
        result = await db.execute(
            select(User)
            .where(User.email == email)
            .where(User.is_active == True)
            .where(User.deleted_at == None)
        )
        return result.scalar_one_or_none()

    async def authenticate(
        self,
        db: AsyncSession,
        *,
        email: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user with email and password.

        Args:
            db: Database session
            email: User email
            password: Plain text password

        Returns:
            User if authenticated, None otherwise
        """
        user = await self.get_active_by_email(db, email=email)
        if not user:
            return None
        if not user.verify_password(password):
            return None
        return user

    async def update_last_login(
        self,
        db: AsyncSession,
        *,
        user: User
    ) -> User:
        """Update user's last login timestamp.

        Args:
            db: Database session
            user: User instance

        Returns:
            Updated user
        """
        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        return user

    async def increment_failed_login(
        self,
        db: AsyncSession,
        *,
        user: User
    ) -> User:
        """Increment failed login count.

        Args:
            db: Database session
            user: User instance

        Returns:
            Updated user
        """
        user.failed_login_count += 1
        await db.commit()
        await db.refresh(user)
        return user

    async def reset_failed_login(
        self,
        db: AsyncSession,
        *,
        user: User
    ) -> User:
        """Reset failed login count to zero.

        Args:
            db: Database session
            user: User instance

        Returns:
            Updated user
        """
        user.failed_login_count = 0
        await db.commit()
        await db.refresh(user)
        return user


# Singleton instance
user_crud = CRUDUser(User)
