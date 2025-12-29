"""
Schemas for EDA insights agent input/output.

This module defines Pydantic models for type-safe communication
between ydata-profiling and the LangChain agent.
"""

from .input_schema import EDAInsightInput, ColumnInfo, CorrelationInfo
from .response_schema import EDAInsightOutput, Insight

__all__ = [
    "EDAInsightInput",
    "ColumnInfo",
    "CorrelationInfo",
    "EDAInsightOutput",
    "Insight",
]
