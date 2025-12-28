"""
ML Pipeline Pydantic schemas.

Request/response models for pipeline configuration, validation,
and execution.

Layer: 2 (API)
Dependencies: pydantic, typing, datetime
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PipelineStepType(str, Enum):
    """Pipeline step categories."""

    PREPROCESSING = "preprocessing"
    FEATURE_ENGINEERING = "feature_engineering"
    MODEL_TRAINING = "model_training"
    EVALUATION = "evaluation"


class PipelineStepConfig(BaseModel):
    """Configuration for a single pipeline step."""

    type: PipelineStepType = Field(description="Step category")
    operation: str = Field(
        description="Specific operation (e.g., 'standard_scaler', 'random_forest')"
    )
    parameters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Step-specific parameters"
    )
    depends_on: List[str] = Field(
        default_factory=list,
        description="IDs of prerequisite steps"
    )


class PipelineConfigRequest(BaseModel):
    """
    Pipeline creation/update request.

    Defines full ML pipeline configuration with ordered steps.

    Example:
        {
            "name": "Customer Churn Predictor",
            "dataset_id": "uuid-123",
            "steps": [
                {
                    "type": "preprocessing",
                    "operation": "handle_missing",
                    "parameters": {"strategy": "mean"}
                }
            ]
        }
    """

    name: str = Field(
        min_length=1,
        max_length=255,
        description="Human-readable pipeline name"
    )
    dataset_id: str = Field(
        description="Dataset UUID to process"
    )
    steps: List[PipelineStepConfig] = Field(
        min_length=1,
        description="Ordered pipeline steps"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Pipeline purpose and notes"
    )


class PipelineValidationError(BaseModel):
    """Single validation error in pipeline config."""

    step_index: int = Field(description="Zero-based step index with error")
    field: str = Field(description="Problematic field")
    message: str = Field(description="Error description")


class PipelineValidationResponse(BaseModel):
    """
    Pipeline configuration validation result.

    Returned before saving to catch configuration errors early.
    """

    valid: bool = Field(description="Whether pipeline config is valid")
    errors: List[PipelineValidationError] = Field(
        default_factory=list,
        description="Validation errors if invalid"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Non-blocking warnings (e.g., performance hints)"
    )


class PipelineResponse(BaseModel):
    """
    Pipeline details response.

    Full pipeline configuration and metadata.
    """

    id: str = Field(description="Pipeline UUID")
    name: str = Field(description="Pipeline name")
    dataset_id: str = Field(description="Associated dataset UUID")
    steps: List[PipelineStepConfig] = Field(description="Pipeline steps")
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last modification timestamp")
    created_by: Optional[str] = Field(
        default=None,
        description="User ID of creator (future auth phase)"
    )
