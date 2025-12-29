"""Input schema for pipeline builder agent."""

from typing import Dict, Literal

from pydantic import BaseModel, Field


class ColumnStats(BaseModel):
    """Statistical summary for a single column."""

    column_name: str = Field(description="Name of the column")
    data_type: Literal["numeric", "categorical"] = Field(description="Column data type")
    missing_pct: float = Field(description="Percentage of missing values (0-100)")
    unique_values: int = Field(description="Number of unique values")
    has_outliers: bool = Field(default=False, description="Whether outliers detected")
    stats: Dict[str, float] = Field(
        default_factory=dict, description="Statistical metrics (mean, std, skewness, etc.)"
    )
    target_correlation: float = Field(
        default=0.0, description="Correlation with target variable"
    )


class PipelinePlanInput(BaseModel):
    """Input to pipeline builder agent containing EDA summary."""

    dataset_id: str = Field(description="UUID of the dataset")
    target_column: str = Field(description="Target variable for prediction")
    task_type: Literal["classification", "regression"] = Field(
        description="ML task type"
    )
    num_rows: int = Field(description="Number of rows in dataset")
    num_columns: int = Field(description="Number of columns in dataset")
    columns: Dict[str, ColumnStats] = Field(
        description="Column-level statistics from EDA"
    )


class PlannerState(BaseModel):
    """State for LangGraph planner workflow."""

    input_data: PipelinePlanInput
    plan: Dict = Field(default_factory=dict)
    validation_result: Dict = Field(default_factory=dict)
    errors: list[str] = Field(default_factory=list)
