"""Tree-based feature importance analyzer."""

from typing import Any, Dict, List

from ..feature_analyzer_base import BaseFeatureAnalyzer


class TreeBasedAnalyzer(BaseFeatureAnalyzer):
    """Analyze feature importance using tree-based models."""

    def analyze(
        self,
        model: Any,
        X: Any,
        y: Any,
        feature_names: list[str] | None = None,
    ) -> List[Dict[str, Any]]:
        """Analyze global feature importance from tree model."""
        pass

    def analyze_local(
        self,
        model: Any,
        X_instance: Any,
        feature_names: list[str] | None = None,
    ) -> Dict[str, Any]:
        """Analyze local feature contributions for a single instance."""
        pass
