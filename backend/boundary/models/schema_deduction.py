"""
Schema deduction model for agent-proposed column types.

Purpose: Stores schema deduction results from LangChain agents
Layer: Boundary (Layer 4 - Database I/O)
Dependencies: SQLAlchemy
"""

from typing import TYPE_CHECKING

from sqlalchemy import (
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


class SchemaDeduction(Base, UUIDMixin, TimestampMixin):
    """Schema deduction from LangChain agents."""

    __tablename__ = "schema_deductions"

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

    # Deduction results
    proposed_schema: Mapped[dict] = mapped_column(JSONB, nullable=False)
    column_metadata: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default="proposed",
        nullable=False,
    )
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)

    # Agent metadata
    agent_version: Mapped[str] = mapped_column(String(50), nullable=False)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    dataset: Mapped["Dataset"] = relationship(
        "Dataset",
        back_populates="schema_deductions",
    )

    # Constraints and indexes
    __table_args__ = (
        CheckConstraint(
            "status IN ('proposed', 'accepted', 'rejected', 'superseded')",
            name="valid_schema_status",
        ),
        CheckConstraint(
            "confidence_score >= 0 AND confidence_score <= 1",
            name="valid_confidence_score",
        ),
        Index("idx_schema_dataset", "dataset_id"),
        Index("idx_schema_status", "status"),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<SchemaDeduction(id={self.id}, dataset_id={self.dataset_id}, status={self.status})>"
