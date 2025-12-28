"""
EDA result data structures.

Purpose: Domain models for EDA reports
Layer: Core (Domain Logic)
Dependencies: dataclasses, typing
"""

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class EDASummary:
    """Summary statistics from EDA report."""

    num_rows: int
    num_columns: int
    missing_percentage: float
    duplicate_rows: int
    memory_usage_bytes: int

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "num_rows": self.num_rows,
            "num_columns": self.num_columns,
            "missing_percentage": self.missing_percentage,
            "duplicate_rows": self.duplicate_rows,
            "memory_usage_bytes": self.memory_usage_bytes,
        }


@dataclass
class EDAResult:
    """Complete EDA report result.

    Contains both summary stats and full ydata-profiling report.
    """

    summary: EDASummary
    full_report_json: Dict[str, Any]
    generation_time_seconds: float
    report_version: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            "summary": self.summary.to_dict(),
            "full_report": self.full_report_json,
            "generation_time_seconds": self.generation_time_seconds,
            "report_version": self.report_version,
        }
