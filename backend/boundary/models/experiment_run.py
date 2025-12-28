"""
Experiment run model for training metrics and hyperparameter tracking.

Purpose: Stores detailed metrics for each experiment run during training
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.boundary.models.training_job import TrainingJob
    from backend.boundary.models.user import User


class ExperimentRun(Base, UUIDMixin, TimestampMixin):
    """Experiment run for hyperparameter tracking."""

    __tablename__ = "experiment_runs"

    # Foreign keys
    training_job_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("training_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Run metadata
    run_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # Hyperparameters and metrics
    hyperparameters: Mapped[dict] = mapped_column(JSONB, nullable=False)
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Timing
    training_time_seconds: Mapped[float] = mapped_column(Float, nullable=False)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default="running",
        nullable=False,
    )

    # Relationships
    training_job: Mapped["TrainingJob"] = relationship(
        "TrainingJob",
        back_populates="experiment_runs",
    )

    # Constraints and indexes
    __table_args__ = (
        CheckConstraint(
            "status IN ('running', 'completed', 'failed')",
            name="valid_run_status",
        ),
        Index("idx_runs_job", "training_job_id"),
        Index("idx_runs_metrics", "metrics", postgresql_using="gin"),
        Index("idx_runs_job_number", "training_job_id", "run_number", unique=True),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<ExperimentRun(id={self.id}, job_id={self.training_job_id}, run={self.run_number})>"
