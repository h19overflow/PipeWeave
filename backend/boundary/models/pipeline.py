"""
Pipeline model for ML pipeline configurations.

Purpose: Stores pipeline DAG configurations with versioning
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from datetime import datetime
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import (
    Base,
    UUIDMixin,
    TimestampMixin,
    SoftDeleteMixin,
)

if TYPE_CHECKING:
    from backend.boundary.models.dataset import Dataset
    from backend.boundary.models.training_job import TrainingJob
    from backend.boundary.models.user import User


class Pipeline(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """ML pipeline configuration model."""

    __tablename__ = "pipelines"

    # Foreign keys
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    dataset_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Metadata
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Pipeline configuration
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    node_registry: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Versioning
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default="draft",
        nullable=False,
    )
    validated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="pipelines")
    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="pipelines")
    training_jobs: Mapped[list["TrainingJob"]] = relationship(
        "TrainingJob",
        back_populates="pipeline",
        cascade="all, delete-orphan",
    )

    # Constraints and indexes
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'validated', 'archived')",
            name="valid_pipeline_status",
        ),
        Index("idx_pipelines_user", "user_id", postgresql_where=sa.text("deleted_at IS NULL")),
        Index("idx_pipelines_dataset", "dataset_id"),
        Index("idx_pipelines_config", "config", postgresql_using="gin"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<Pipeline(id={self.id}, name={self.name}, version={self.version})>"
