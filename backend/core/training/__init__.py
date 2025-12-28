"""
Training Core Module - Model training and metrics calculation.

Exports:
    BaseTrainer: Abstract base for training implementations
    BaseMetricsCalculator: Abstract base for metrics calculation
    RandomForestTrainer: Random Forest trainer implementation
    MetricsCalculator: Metrics calculation implementation
    TrainingConfig, TrainingResult: Domain models
"""

from backend.core.training.base import BaseTrainer, BaseMetricsCalculator
from backend.core.training.trainers import RandomForestTrainer
from backend.core.training.metrics import MetricsCalculator
from backend.core.training.models import (
    TrainingConfig,
    TrainingResult,
    ClassificationMetrics,
    RegressionMetrics,
    FeatureImportance,
)

__all__ = [
    "BaseTrainer",
    "BaseMetricsCalculator",
    "RandomForestTrainer",
    "MetricsCalculator",
    "TrainingConfig",
    "TrainingResult",
    "ClassificationMetrics",
    "RegressionMetrics",
    "FeatureImportance",
]
