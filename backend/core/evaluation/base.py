"""
Abstract Base Classes for Evaluation Module.

Defines contracts for model evaluation, feature analysis, and report generation.

Layer: 3 (Business Logic)
"""

from backend.core.evaluation.evaluator_base import BaseModelEvaluator
from backend.core.evaluation.feature_analyzer_base import BaseFeatureAnalyzer
from backend.core.evaluation.report_builder_base import (
    BaseEvaluationReportBuilder,
)

__all__ = [
    "BaseModelEvaluator",
    "BaseFeatureAnalyzer",
    "BaseEvaluationReportBuilder",
]
