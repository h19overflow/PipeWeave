"""Response schema for pipeline builder output (ColumnTransformer config)."""

from typing import Dict, List

from pydantic import BaseModel, Field


class TransformerConfig(BaseModel):
    """Configuration for a single transformer in the pipeline."""

    name: str = Field(description="Transformer identifier")
    transformer_type: str = Field(description="Sklearn transformer class name")
    columns: List[str] = Field(description="Columns to transform")
    parameters: Dict = Field(default_factory=dict, description="Transformer parameters")


class PipelineOutput(BaseModel):
    """Final output containing ColumnTransformer configuration."""

    plan_id: str = Field(description="UUID of the preprocessing plan")
    dataset_id: str = Field(description="UUID of the dataset")
    transformers: List[TransformerConfig] = Field(
        description="List of transformers in execution order"
    )
    numeric_columns: List[str] = Field(
        default_factory=list, description="Numeric columns in pipeline"
    )
    categorical_columns: List[str] = Field(
        default_factory=list, description="Categorical columns in pipeline"
    )
    validation_passed: bool = Field(
        default=False, description="Whether pipeline validation succeeded"
    )
    validation_errors: List[str] = Field(
        default_factory=list, description="Validation error messages"
    )
    output_shape: tuple[int, int] | None = Field(
        default=None, description="Expected output shape after transformation"
    )
