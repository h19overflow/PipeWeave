"""
Metrics Calculator.

Calculates performance metrics for classification/regression models.
Pure logic - no I/O operations.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

from backend.core.training.base import BaseMetricsCalculator
from backend.core.training.models import ClassificationMetrics, RegressionMetrics


class MetricsCalculator(BaseMetricsCalculator):
    """Calculates model performance metrics (classification/regression)."""

    def calculate_classification(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        class_labels: list[str],
    ) -> ClassificationMetrics:
        """Calculate classification metrics. Binary: 'binary' avg, multiclass: 'weighted'."""
        # Handle multiclass vs binary
        average = "binary" if len(class_labels) == 2 else "weighted"

        cm = confusion_matrix(y_true, y_pred)

        # ROC AUC (binary only)
        roc_auc = None
        if len(class_labels) == 2:
            try:
                roc_auc = float(roc_auc_score(y_true, y_pred))
            except ValueError:
                # Can fail if only one class present in y_true
                pass

        return ClassificationMetrics(
            accuracy=float(accuracy_score(y_true, y_pred)),
            precision=float(
                precision_score(y_true, y_pred, average=average, zero_division=0)
            ),
            recall=float(
                recall_score(y_true, y_pred, average=average, zero_division=0)
            ),
            f1_score=float(
                f1_score(y_true, y_pred, average=average, zero_division=0)
            ),
            confusion_matrix=cm.tolist(),
            class_labels=class_labels,
            roc_auc=roc_auc,
        )

    def calculate_regression(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
    ) -> RegressionMetrics:
        """Calculate regression metrics. MAPE is None if y_true has zeros."""
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true, y_pred)

        # MAPE (handle zeros in y_true)
        mape = None
        if not np.any(y_true == 0):
            mape = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)

        return RegressionMetrics(
            mae=float(mae),
            mse=float(mse),
            rmse=float(rmse),
            r2_score=float(r2),
            mape=mape,
        )
