"""
Abstract Base Class for Feature Analyzers.

Defines interface for feature importance and impact analysis.
Enables extensibility: tree-based, SHAP, LIME, permutation importance.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import numpy as np


class BaseFeatureAnalyzer(ABC):
    """
    Abstract base for feature importance/impact analysis.

    Subclasses implement various feature analysis strategies:
    - TreeBasedAnalyzer (feature_importances_ from tree models)
    - PermutationAnalyzer (permutation importance - model-agnostic)
    - SHAPAnalyzer (SHAP values - game theory approach)
    - LIMEAnalyzer (local interpretable model-agnostic explanations)

    All analyzers must:
    - Accept trained model + data
    - Return ranked feature importance scores
    - Support global and local explanations
    - Provide visualization-ready data
    """

    @abstractmethod
    def analyze(
        self,
        model: Any,
        X: np.ndarray,
        y: Optional[np.ndarray] = None,
        feature_names: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Analyze feature importance and impact on model predictions.

        Args:
            model: Trained sklearn-like model
            X: Feature matrix (shape: [n_samples, n_features])
            y: Optional ground truth (needed for permutation importance)
            feature_names: Optional feature names for reporting

        Returns:
            List of feature importance dictionaries, sorted by importance (descending):
                [
                    {
                        "feature_name": str,
                        "importance": float,
                        "rank": int,
                        "confidence_interval": Optional[Tuple[float, float]]
                    },
                    ...
                ]

        Raises:
            ValueError: If model not fitted or feature_names length mismatch

        Example:
            >>> analyzer = TreeBasedAnalyzer()
            >>> importance = analyzer.analyze(model, X_train, feature_names=["age", "income"])
            >>> print(f"Top feature: {importance[0]['feature_name']}")
        """
        pass

    @abstractmethod
    def analyze_local(
        self,
        model: Any,
        X_instance: np.ndarray,
        feature_names: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Explain model prediction for a single instance (local explanation).

        Args:
            model: Trained sklearn-like model
            X_instance: Single instance features (shape: [n_features] or [1, n_features])
            feature_names: Optional feature names for reporting

        Returns:
            Dictionary containing:
                - prediction: Model prediction for instance
                - feature_contributions: Per-feature contribution to prediction
                - baseline: Model baseline prediction
                - visualization_data: Data for waterfall/force plots

        Raises:
            ValueError: If model not fitted or instance shape invalid

        Example:
            >>> analyzer = SHAPAnalyzer()
            >>> explanation = analyzer.analyze_local(model, X_test[0])
            >>> print(f"Prediction: {explanation['prediction']}")
        """
        pass
