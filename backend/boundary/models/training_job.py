"""
Training job model for model training metadata and tracking.

Purpose: Stores training job status and progress
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from datetime import datetime
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.boundary.models.dataset import Dataset
    from backend.boundary.models.experiment_run import ExperimentRun
    from backend.boundary.models.model import Model
    from backend.boundary.models.pipeline import Pipeline
    from backend.boundary.models.user import User


class TrainingJob(Base, UUIDMixin, TimestampMixin):
    """Training job tracking model."""

    __tablename__ = "training_jobs"

    # Foreign keys
    pipeline_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
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
    )

    # Pipeline snapshot (immutable copy)
    pipeline_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Status tracking
    status: Mapped[str] = mapped_column(
        String(50),
        default="queued",
        nullable=False,
    )
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_step: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    heartbeat_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    training_duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Celery integration
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    # Error tracking
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_traceback: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    pipeline: Mapped["Pipeline"] = relationship("Pipeline", back_populates="training_jobs")
    models: Mapped[list["Model"]] = relationship(
        "Model",
        back_populates="training_job",
    )
    experiment_runs: Mapped[list["ExperimentRun"]] = relationship(
        "ExperimentRun",
        back_populates="training_job",
        cascade="all, delete-orphan",
    )

    # Constraints and indexes
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'cancelled')",
            name="valid_job_status",
        ),
        CheckConstraint(
            "progress_percentage >= 0 AND progress_percentage <= 100",
            name="valid_progress",
        ),
        CheckConstraint(
            "priority >= 1 AND priority <= 10",
            name="valid_priority",
        ),
        Index("idx_jobs_status", "status"),
        Index("idx_jobs_user", "user_id"),
        Index("idx_jobs_heartbeat", "heartbeat_at", postgresql_where=sa.text("status = 'running'")),
        Index("idx_jobs_pipeline", "pipeline_id"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<TrainingJob(id={self.id}, status={self.status}, progress={self.progress_percentage}%)>"
