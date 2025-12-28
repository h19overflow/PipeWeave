"""
User model for authentication and authorization.

Purpose: Stores user accounts with security features
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from datetime import datetime
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy import Boolean, Integer, String, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import (
    Base,
    UUIDMixin,
    TimestampMixin,
    SoftDeleteMixin,
)

if TYPE_CHECKING:
    from backend.boundary.models.dataset import Dataset
    from backend.boundary.models.pipeline import Pipeline
    from backend.boundary.models.model import Model


class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """User account model."""

    __tablename__ = "users"

    # Authentication
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Profile
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Security tracking
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    password_changed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    datasets: Mapped[list["Dataset"]] = relationship(
        "Dataset",
        back_populates="user",
    )
    pipelines: Mapped[list["Pipeline"]] = relationship(
        "Pipeline",
        back_populates="user",
    )
    models: Mapped[list["Model"]] = relationship(
        "Model",
        back_populates="user",
    )

    # Indexes
    __table_args__ = (
        Index("idx_users_email", "email", unique=True),
        Index("idx_users_active", "is_active", postgresql_where=sa.text("is_active = true")),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<User(id={self.id}, email={self.email})>"
