"""
Exploratory Data Analysis (EDA) Pydantic schemas.

Request/response models for EDA summary statistics and visualizations.

Layer: 2 (API)
Dependencies: pydantic, typing, datetime
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class VisualizationType(str, Enum):
    """EDA visualization types."""

    HISTOGRAM = "histogram"
    BOX_PLOT = "box_plot"
    SCATTER = "scatter"
    CORRELATION_MATRIX = "correlation_matrix"
    BAR_CHART = "bar_chart"
    LINE_CHART = "line_chart"


class ColumnStatistics(BaseModel):
    """Statistical summary for a single column."""

    name: str = Field(description="Column name")
    dtype: str = Field(description="Data type (int64, float64, object, etc.)")
    null_count: int = Field(description="Number of null values")
    unique_count: int = Field(description="Number of unique values")
    mean: Optional[float] = Field(default=None, description="Mean (numeric only)")
    median: Optional[float] = Field(default=None, description="Median (numeric)")
    std: Optional[float] = Field(default=None, description="Standard deviation")
    min: Optional[Any] = Field(default=None, description="Minimum value")
    max: Optional[Any] = Field(default=None, description="Maximum value")


class EDASummaryResponse(BaseModel):
    """
    Quick EDA summary statistics.

    Lightweight response with basic statistics, no visualizations.
    Used for initial dataset preview.
    """

    dataset_id: str = Field(description="Dataset UUID")
    row_count: int = Field(description="Total rows")
    column_count: int = Field(description="Total columns")
    columns: List[ColumnStatistics] = Field(
        description="Per-column statistics"
    )
    missing_value_percentage: float = Field(
        ge=0.0,
        le=100.0,
        description="Overall missing data percentage"
    )
    generated_at: datetime = Field(description="Analysis timestamp")


class VisualizationMetadata(BaseModel):
    """
    Metadata for a single visualization.

    Contains rendering information and data payload.
    """

    type: VisualizationType = Field(description="Chart type")
    title: str = Field(description="Visualization title")
    column: Optional[str] = Field(
        default=None,
        description="Primary column analyzed (if applicable)"
    )
    data: Dict[str, Any] = Field(
        description="Chart-specific data payload (format varies by type)"
    )


class EDAReportResponse(BaseModel):
    """
    Full EDA report with visualizations.

    Complete analysis including summary statistics and generated charts.
    Larger payload, used when user explicitly requests full report.
    """

    dataset_id: str = Field(description="Dataset UUID")
    summary: EDASummaryResponse = Field(
        description="Basic statistics"
    )
    visualizations: List[VisualizationMetadata] = Field(
        description="Generated charts and plots"
    )
    insights: List[str] = Field(
        default_factory=list,
        description="Automated insights (e.g., 'High correlation between X and Y')"
    )
    report_id: str = Field(description="EDA report UUID for caching")
    generated_at: datetime = Field(description="Report generation timestamp")


class EDAJobResponse(BaseModel):
    """Response for queued EDA generation job."""

    report_id: str = Field(description="EDA report UUID")
    job_id: str = Field(description="Celery task ID")
    status: str = Field(description="Job status (queued, running, completed, failed)")


class EDAStatusResponse(BaseModel):
    """EDA job status and progress."""

    status: str = Field(description="Job status")
    progress_pct: int = Field(ge=0, le=100, description="Progress percentage")
    step: Optional[str] = Field(default=None, description="Current step description")
    error: Optional[str] = Field(default=None, description="Error message if failed")
