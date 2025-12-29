"""Preprocessing plan schema output from planner LLM."""

from typing import Dict, List, Literal

from pydantic import BaseModel, Field


class PreprocessingStep(BaseModel):
    """Single preprocessing step in the plan."""

    step_number: int = Field(description="Order of execution")
    stage: Literal["imputation", "scaling", "encoding"] = Field(
        description="Preprocessing stage"
    )
    target_columns: List[str] = Field(description="Columns to transform")
    strategy: str = Field(description="Strategy name (e.g., 'median', 'robust', 'onehot')")
    parameters: Dict = Field(
        default_factory=dict, description="Additional parameters for transformer"
    )
    rationale: str = Field(description="Why this strategy was chosen")


class PreprocessingPlan(BaseModel):
    """Complete preprocessing plan from planner LLM."""

    plan_version: str = Field(default="v1.0", description="Plan schema version")
    reasoning: str = Field(description="Overall preprocessing strategy rationale")
    steps: List[PreprocessingStep] = Field(description="Ordered preprocessing steps")
    final_pipeline: Dict = Field(
        default_factory=dict,
        description="Summary of numeric and categorical transformers",
    )


class FinalPipelineConfig(BaseModel):
    """Summary of final pipeline configuration."""

    numeric_transformers: List[Dict[str, str]] = Field(
        default_factory=list, description="Numeric pipeline steps"
    )
    categorical_transformers: List[Dict[str, str]] = Field(
        default_factory=list, description="Categorical pipeline steps"
    )
