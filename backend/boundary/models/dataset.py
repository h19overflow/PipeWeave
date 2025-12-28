"""
Dataset model for uploaded CSV files.

Purpose: Stores dataset metadata with S3 references
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy import (
    BigInteger,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.boundary.models.base import (
    Base,
    UUIDMixin,
    TimestampMixin,
    SoftDeleteMixin,
)

if TYPE_CHECKING:
    from backend.boundary.models.user import User
    from backend.boundary.models.schema_deduction import SchemaDeduction
    from backend.boundary.models.eda_report import EDAReport
    from backend.boundary.models.pipeline import Pipeline


class Dataset(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Dataset model for CSV file uploads."""

    __tablename__ = "datasets"

    # Foreign keys
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Metadata
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # S3 references
    s3_bucket: Mapped[str] = mapped_column(String(255), nullable=False)
    s3_key_raw: Mapped[str] = mapped_column(String(512), nullable=False)
    s3_key_processed: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # File metadata
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    file_hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    content_type: Mapped[str] = mapped_column(
        String(100),
        default="text/csv",
        nullable=False,
    )

    # Schema info
    num_rows: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    num_columns: Mapped[int | None] = mapped_column(Integer, nullable=True)
    column_names: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text),
        nullable=True,
    )

    # Status tracking
    status: Mapped[str] = mapped_column(
        String(50),
        default="uploading",
        nullable=False,
    )
    validation_errors: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="datasets")
    schema_deductions: Mapped[list["SchemaDeduction"]] = relationship(
        "SchemaDeduction",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )
    eda_reports: Mapped[list["EDAReport"]] = relationship(
        "EDAReport",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )
    pipelines: Mapped[list["Pipeline"]] = relationship(
        "Pipeline",
        back_populates="dataset",
    )

    # Constraints and indexes
    __table_args__ = (
        CheckConstraint(
            "status IN ('uploading', 'uploaded', 'validating', 'validated', 'failed')",
            name="valid_dataset_status",
        ),
        CheckConstraint("file_size_bytes > 0", name="positive_file_size"),
        Index("idx_datasets_user_id", "user_id", postgresql_where=sa.text("deleted_at IS NULL")),
        Index("idx_datasets_status", "status", postgresql_where=sa.text("deleted_at IS NULL")),
        Index("idx_datasets_hash", "file_hash_sha256"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<Dataset(id={self.id}, name={self.name}, status={self.status})>"
