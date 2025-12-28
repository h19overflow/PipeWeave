"""SHAP feature importance analyzer."""

from typing import Any, Dict, List

from ..feature_analyzer_base import BaseFeatureAnalyzer


class SHAPAnalyzer(BaseFeatureAnalyzer):
    """Analyze feature importance using SHAP values."""

    def analyze(
        self,
        model: Any,
        X: Any,
        y: Any,
        feature_names: list[str] | None = None,
    ) -> List[Dict[str, Any]]:
        """Analyze global feature importance using SHAP."""
        pass

    def analyze_local(
        self,
        model: Any,
        X_instance: Any,
        feature_names: list[str] | None = None,
    ) -> Dict[str, Any]:
        """Analyze local feature contributions using SHAP."""
        pass
