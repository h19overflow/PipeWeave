"""Permutation feature importance analyzer."""

from typing import Any, Dict, List

from ..feature_analyzer_base import BaseFeatureAnalyzer


class PermutationAnalyzer(BaseFeatureAnalyzer):
    """Analyze feature importance using permutation method."""

    def analyze(
        self,
        model: Any,
        X: Any,
        y: Any,
        feature_names: list[str] | None = None,
    ) -> List[Dict[str, Any]]:
        """Analyze global feature importance using permutation."""
        pass

    def analyze_local(
        self,
        model: Any,
        X_instance: Any,
        feature_names: list[str] | None = None,
    ) -> Dict[str, Any]:
        """Analyze local feature contributions using permutation."""
        pass
