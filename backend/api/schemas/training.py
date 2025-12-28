"""
Model Training Pydantic schemas.

Request/response models for training job submission, status tracking,
and metrics retrieval.

Layer: 2 (API)
Dependencies: pydantic, typing, datetime
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TrainingStatus(str, Enum):
    """Training job lifecycle status."""

    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class HyperparameterConfig(BaseModel):
    """Hyperparameter configuration for model training."""

    learning_rate: Optional[float] = Field(
        default=None,
        gt=0.0,
        description="Learning rate for optimizer"
    )
    batch_size: Optional[int] = Field(
        default=None,
        ge=1,
        description="Training batch size"
    )
    epochs: Optional[int] = Field(
        default=None,
        ge=1,
        description="Number of training epochs"
    )
    custom_params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Model-specific hyperparameters"
    )


class TrainingJobRequest(BaseModel):
    """
    Training job submission request.

    Submits ML training job to Celery queue for async execution.

    Example:
        {
            "pipeline_id": "uuid-123",
            "model_type": "random_forest",
            "hyperparameters": {
                "epochs": 100,
                "batch_size": 32
            }
        }
    """

    pipeline_id: str = Field(
        description="Pipeline UUID defining data processing"
    )
    model_type: str = Field(
        description="Model architecture (e.g., 'random_forest', 'xgboost')"
    )
    hyperparameters: HyperparameterConfig = Field(
        default_factory=HyperparameterConfig,
        description="Training hyperparameters"
    )
    validation_split: float = Field(
        default=0.2,
        ge=0.0,
        le=0.5,
        description="Fraction of data for validation"
    )
    experiment_name: Optional[str] = Field(
        default=None,
        description="Optional experiment grouping name"
    )


class TrainingMetrics(BaseModel):
    """Training and validation metrics."""

    train_accuracy: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Training set accuracy"
    )
    val_accuracy: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Validation set accuracy"
    )
    train_loss: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Training loss"
    )
    val_loss: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Validation loss"
    )
    custom_metrics: Dict[str, float] = Field(
        default_factory=dict,
        description="Additional metrics (F1, precision, etc.)"
    )


class TrainingJobStatusResponse(BaseModel):
    """
    Training job status response.

    Real-time status for in-progress or completed training jobs.
    """

    job_id: str = Field(description="Training job UUID")
    pipeline_id: str = Field(description="Associated pipeline UUID")
    status: TrainingStatus = Field(description="Current job status")
    progress_percentage: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Training progress (0-100)"
    )
    started_at: Optional[datetime] = Field(
        default=None,
        description="Job start timestamp"
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="Job completion timestamp"
    )
    error_message: Optional[str] = Field(
        default=None,
        description="Error details if status=failed"
    )


class TrainingJobMetricsResponse(BaseModel):
    """
    Training job metrics response.

    Detailed metrics for completed training job.
    """

    job_id: str = Field(description="Training job UUID")
    metrics: TrainingMetrics = Field(description="Final metrics")
    model_artifact_url: Optional[str] = Field(
        default=None,
        description="S3 presigned URL for trained model download"
    )
    generated_at: datetime = Field(description="Metrics snapshot timestamp")
