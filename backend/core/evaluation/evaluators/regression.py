"""Regression model evaluator."""

from typing import Any, Dict

from ..evaluator_base import BaseModelEvaluator


class RegressionEvaluator(BaseModelEvaluator):
    """Evaluate regression models."""

    def evaluate(
        self,
        model: Any,
        X_test: Any,
        y_test: Any,
        feature_names: list[str] | None = None,
    ) -> Dict[str, Any]:
        """Evaluate regression model performance."""
        pass
