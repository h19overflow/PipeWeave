"""
Model artifact model for trained ML models.

Purpose: Stores model metadata with S3 references to artifacts
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from datetime import datetime
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.boundary.models.pipeline import Pipeline
    from backend.boundary.models.training_job import TrainingJob
    from backend.boundary.models.user import User


class Model(Base, UUIDMixin, TimestampMixin):
    """Trained model artifact model."""

    __tablename__ = "models"

    # Foreign keys
    training_job_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("training_jobs.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    pipeline_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="RESTRICT"),
        nullable=False,
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Model metadata
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_type: Mapped[str] = mapped_column(String(100), nullable=False)
    framework_version: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # S3 references
    s3_bucket: Mapped[str] = mapped_column(String(255), nullable=False)
    s3_key_artifact: Mapped[str] = mapped_column(String(512), nullable=False)
    s3_key_config: Mapped[str | None] = mapped_column(String(512), nullable=True)
    s3_key_metadata: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Artifact info
    artifact_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    artifact_checksum: Mapped[str] = mapped_column(String(64), nullable=False)

    # Performance summary
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Deployment
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_production: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deployed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    training_job: Mapped["TrainingJob"] = relationship(
        "TrainingJob",
        back_populates="models",
    )
    user: Mapped["User"] = relationship("User", back_populates="models")

    # Indexes
    __table_args__ = (
        Index("idx_models_job", "training_job_id"),
        Index("idx_models_production", "is_production", postgresql_where=sa.text("is_production = true")),
        Index("idx_models_metrics", "metrics", postgresql_using="gin"),
        Index("idx_models_pipeline_version", "pipeline_id", "version", unique=True),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<Model(id={self.id}, name={self.name}, type={self.model_type}, version={self.version})>"
