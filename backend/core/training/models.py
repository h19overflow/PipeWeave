"""
Training Domain Models.

Dataclasses for training configuration, metrics, and results.
Pure data structures.
"""

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class TrainingConfig:
    """Training configuration: target, task type, hyperparameters."""

    target_column: str
    task_type: str  # "classification" or "regression"
    test_size: float = 0.2
    random_state: int = 42
    n_estimators: int = 100
    max_depth: Optional[int] = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1


@dataclass
class ClassificationMetrics:
    """Classification metrics: accuracy, precision, recall, F1, confusion matrix, ROC AUC."""

    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: list[list[int]]
    class_labels: list[str]
    roc_auc: Optional[float] = None


@dataclass
class RegressionMetrics:
    """Regression metrics: MAE, MSE, RMSE, R2, MAPE (None if y has zeros)."""

    mae: float
    mse: float
    rmse: float
    r2_score: float
    mape: Optional[float] = None


@dataclass
class FeatureImportance:
    """Feature importance: name, score (0-1), rank (1=best)."""

    feature_name: str
    importance: float
    rank: int


@dataclass
class TrainingResult:
    """Complete training result: model, metrics, importances, timing, dataset info."""

    model: Any  # Trained sklearn model
    config: TrainingConfig
    classification_metrics: Optional[ClassificationMetrics] = None
    regression_metrics: Optional[RegressionMetrics] = None
    feature_importances: list[FeatureImportance] = field(default_factory=list)
    feature_names: list[str] = field(default_factory=list)
    preprocessing_time_seconds: float = 0.0
    training_time_seconds: float = 0.0
    total_time_seconds: float = 0.0
    train_samples: int = 0
    test_samples: int = 0
