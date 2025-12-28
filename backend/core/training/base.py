"""
Abstract Base Classes for Training Components.

Defines interfaces for ML trainers and metrics calculators.
Enables extensibility: RandomForest, XGBoost, LightGBM, neural networks, etc.
"""

from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional

import numpy as np
import pandas as pd

from backend.core.training.models import (
    ClassificationMetrics,
    FeatureImportance,
    RegressionMetrics,
    TrainingConfig,
    TrainingResult,
)


class BaseTrainer(ABC):
    """
    Abstract base for ML model trainers.

    Subclasses implement specific algorithms:
    - RandomForestTrainer (current)
    - XGBoostTrainer (future)
    - LightGBMTrainer (future)
    - KerasNeuralNetTrainer (future)

    All trainers must:
    - Accept DataFrame + TrainingConfig
    - Return TrainingResult with model + metrics
    - Support progress reporting via callback
    - Handle both classification and regression
    """

    @abstractmethod
    def train(
        self,
        df: pd.DataFrame,
        config: TrainingConfig,
        progress_callback: Optional[Callable[[int, str], None]] = None,
    ) -> TrainingResult:
        """
        Train model and return complete training result.

        Args:
            df: Input DataFrame with all columns (features + target)
            config: Training configuration (hyperparameters, task type, etc.)
            progress_callback: Optional callback(percent, message) for progress updates
                              percent: 0-100 integer
                              message: Human-readable status string

        Returns:
            TrainingResult containing:
                - Trained model (sklearn-like object with .predict())
                - Configuration used
                - Classification or regression metrics
                - Feature importance ranking
                - Timing breakdown
                - Dataset size info

        Raises:
            ValueError: If config.task_type invalid or target column missing
            RuntimeError: If training fails (data issues, convergence, etc.)
        """
        pass


class BaseMetricsCalculator(ABC):
    """
    Abstract base for model performance metrics calculation.

    Subclasses implement domain-specific metrics:
    - MetricsCalculator (classification + regression)
    - TimeSeriesMetrics (MASE, MAPE, forecast horizon, etc.)
    - NLPMetrics (BLEU, ROUGE, perplexity, etc.)
    - ImageMetrics (IoU, mAP, pixel accuracy, etc.)

    All calculators must:
    - Accept ground truth + predictions (numpy arrays)
    - Return domain-specific metrics dataclass
    - Handle edge cases (empty arrays, single class, etc.)
    """

    @abstractmethod
    def calculate_classification(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        class_labels: List[str],
    ) -> ClassificationMetrics:
        """
        Calculate classification performance metrics.

        Args:
            y_true: Ground truth labels (shape: [n_samples])
            y_pred: Predicted labels (shape: [n_samples])
            class_labels: List of class names (for confusion matrix)

        Returns:
            ClassificationMetrics with:
                - accuracy, precision, recall, f1_score
                - confusion_matrix (2D list)
                - class_labels
                - roc_auc (binary only, None for multiclass)

        Notes:
            - Binary classification: Uses 'binary' averaging
            - Multiclass: Uses 'weighted' averaging
            - ROC AUC only computed for binary (2 classes)
        """
        pass

    @abstractmethod
    def calculate_regression(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
    ) -> RegressionMetrics:
        """
        Calculate regression performance metrics.

        Args:
            y_true: Ground truth values (shape: [n_samples])
            y_pred: Predicted values (shape: [n_samples])

        Returns:
            RegressionMetrics with:
                - mae, mse, rmse, r2_score
                - mape (None if y_true contains zeros)

        Notes:
            - MAPE skipped if division by zero would occur
        """
        pass
