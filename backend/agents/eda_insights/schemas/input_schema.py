"""
Input schema for EDA insights agent.

This module defines the structure of ydata-profiling output
that will be passed to the AI agent for analysis.

Layer: 6 (Agent)
Dependencies: Pydantic
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class ColumnInfo(BaseModel):
    """Statistical information for a single column."""

    name: str = Field(description="Column name")
    type: str = Field(description="Column type: numeric, categorical, datetime")
    stats: Optional[Dict[str, float]] = Field(
        default=None,
        description="Statistics: mean, std, min, max, q25, q50, q75"
    )
    outliers: Optional[List[int]] = Field(
        default=None,
        description="Indices of outlier rows (for numeric columns)"
    )
    missing_pct: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Percentage of missing values"
    )
    unique_values: Optional[int] = Field(
        default=None,
        description="Number of unique values (for categorical columns)"
    )
    value_counts: Optional[Dict[str, int]] = Field(
        default=None,
        description="Frequency of each category (for categorical columns)"
    )


class CorrelationInfo(BaseModel):
    """Correlation matrix information."""

    matrix: Dict[str, Dict[str, float]] = Field(
        description="Nested dict: {col1: {col2: correlation_value}}"
    )


class EDAInsightInput(BaseModel):
    """Input to the EDA insights agent from ydata-profiling."""

    summary: Dict[str, Any] = Field(
        description="Overall dataset summary (rows, columns, missing_pct, memory_mb)"
    )
    columns: List[ColumnInfo] = Field(
        description="Per-column statistical information"
    )
    correlations: Optional[CorrelationInfo] = Field(
        default=None,
        description="Correlation matrix for numeric columns"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "summary": {
                    "rows": 891,
                    "columns": 12,
                    "missing_pct": 19.8,
                    "memory_mb": 0.15
                },
                "columns": [
                    {
                        "name": "Age",
                        "type": "numeric",
                        "stats": {
                            "mean": 29.7,
                            "std": 14.5,
                            "min": 0.42,
                            "max": 80.0,
                            "q25": 20.0,
                            "q50": 28.0,
                            "q75": 38.0
                        },
                        "outliers": [631, 852],
                        "missing_pct": 19.9
                    }
                ],
                "correlations": {
                    "matrix": {
                        "Fare": {"Survived": 0.26, "Pclass": -0.55},
                        "Age": {"Survived": -0.08}
                    }
                }
            }
        }
