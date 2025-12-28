"""Time series model evaluator."""

from typing import Any, Dict

from ..evaluator_base import BaseModelEvaluator


class TimeSeriesEvaluator(BaseModelEvaluator):
    """Evaluate time series models."""

    def evaluate(
        self,
        model: Any,
        X_test: Any,
        y_test: Any,
        feature_names: list[str] | None = None,
    ) -> Dict[str, Any]:
        """Evaluate time series model performance."""
        pass
