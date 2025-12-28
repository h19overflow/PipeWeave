"""
Evaluation Module: Model Evaluation and Feature Analysis.

Provides abstract interfaces and implementations for:
- Model performance evaluation (classification, regression)
- Feature importance analysis (tree-based, permutation, SHAP)
- Evaluation report generation

Layer: 3 (Business Logic)
"""

from backend.core.evaluation.base import (
    BaseEvaluationReportBuilder,
    BaseFeatureAnalyzer,
    BaseModelEvaluator,
)
from backend.core.evaluation.evaluators import (
    ClassificationEvaluator,
    RegressionEvaluator,
    TimeSeriesEvaluator,
)
from backend.core.evaluation.analyzers import (
    TreeBasedAnalyzer,
    PermutationAnalyzer,
    SHAPAnalyzer,
)

__all__ = [
    # Abstract base classes
    "BaseModelEvaluator",
    "BaseFeatureAnalyzer",
    "BaseEvaluationReportBuilder",
    # Evaluators
    "ClassificationEvaluator",
    "RegressionEvaluator",
    "TimeSeriesEvaluator",
    # Analyzers
    "TreeBasedAnalyzer",
    "PermutationAnalyzer",
    "SHAPAnalyzer",
]
