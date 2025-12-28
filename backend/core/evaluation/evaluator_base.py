"""
Abstract Base Class for Model Evaluators.

Defines interface for comprehensive model evaluation strategies.
Enables extensibility: classification, regression, time series, multi-output.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import numpy as np


class BaseModelEvaluator(ABC):
    """
    Abstract base for comprehensive model evaluation strategies.

    Subclasses implement domain-specific evaluation workflows:
    - ClassificationEvaluator (accuracy, precision, recall, F1, ROC curves)
    - RegressionEvaluator (MAE, MSE, RMSE, R2, residual analysis)
    - TimeSeriesEvaluator (forecast accuracy, seasonality detection)
    - MultiOutputEvaluator (multi-label, multi-task evaluation)

    All evaluators must:
    - Accept trained model + test data
    - Return comprehensive evaluation metrics
    - Support visualization data generation
    - Handle edge cases (class imbalance, outliers, etc.)
    """

    @abstractmethod
    def evaluate(
        self,
        model: Any,
        X_test: np.ndarray,
        y_test: np.ndarray,
        feature_names: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Comprehensive model evaluation on test data.

        Args:
            model: Trained sklearn-like model with .predict() method
            X_test: Test features (shape: [n_samples, n_features])
            y_test: Ground truth labels/values (shape: [n_samples])
            feature_names: Optional feature names for reporting

        Returns:
            Dictionary containing:
                - metrics: Performance metrics (accuracy, MAE, etc.)
                - predictions: Model predictions on test set
                - errors: Per-sample errors (for analysis)
                - visualizations: Data for plotting (confusion matrix, residuals, etc.)

        Raises:
            ValueError: If model not fitted or data shapes incompatible
            RuntimeError: If evaluation fails (numerical issues, etc.)

        Example:
            >>> evaluator = ClassificationEvaluator()
            >>> results = evaluator.evaluate(model, X_test, y_test)
            >>> print(f"Accuracy: {results['metrics']['accuracy']}")
        """
        pass
