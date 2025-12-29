"""
Tool functions for EDA insights agent.

This module provides deterministic analysis functions that the AI agent
calls to generate specific insights.
"""

from .outlier_detector import detect_outliers_insight
from .imbalance_analyzer import analyze_class_imbalance
from .correlation_interpreter import interpret_correlations
from .missing_value_advisor import missing_value_recommendations
from .summary_generator import generate_summary_recommendation

__all__ = [
    "detect_outliers_insight",
    "analyze_class_imbalance",
    "interpret_correlations",
    "missing_value_recommendations",
    "generate_summary_recommendation",
]
