"""
EDA report model for exploratory data analysis results.

Purpose: Stores EDA reports with hybrid storage (PostgreSQL/S3)
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import Base, UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.boundary.models.dataset import Dataset
    from backend.boundary.models.user import User


class EDAReport(Base, UUIDMixin, TimestampMixin):
    """EDA report with hybrid storage."""

    __tablename__ = "eda_reports"

    # Foreign keys
    dataset_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Summary stats (always in PostgreSQL)
    summary: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Full report storage
    report_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_location: Mapped[str] = mapped_column(String(10), nullable=False)

    # PostgreSQL storage (if < 1MB)
    full_report: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # S3 storage (if > 1MB)
    s3_bucket: Mapped[str | None] = mapped_column(String(255), nullable=True)
    s3_key: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Metadata
    report_version: Mapped[str] = mapped_column(String(20), nullable=False)
    generation_time_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default="running",
        nullable=False,
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    dataset: Mapped["Dataset"] = relationship(
        "Dataset",
        back_populates="eda_reports",
    )

    # Constraints and indexes
    __table_args__ = (
        CheckConstraint(
            "storage_location IN ('postgres', 's3')",
            name="valid_storage_location",
        ),
        CheckConstraint(
            "(storage_location = 'postgres' AND full_report IS NOT NULL) OR "
            "(storage_location = 's3' AND s3_bucket IS NOT NULL AND s3_key IS NOT NULL)",
            name="valid_storage_data",
        ),
        CheckConstraint(
            "status IN ('running', 'completed', 'failed')",
            name="valid_eda_status",
        ),
        Index("idx_eda_dataset", "dataset_id"),
        Index("idx_eda_summary", "summary", postgresql_using="gin"),
        Index("idx_eda_status", "status", postgresql_where=sa.text("status = 'running'")),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<EDAReport(id={self.id}, dataset_id={self.dataset_id}, storage={self.storage_location})>"
