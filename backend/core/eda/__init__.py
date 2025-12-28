"""
EDA Core Module - Pure business logic for exploratory data analysis.

This module provides structured EDA generation using ydata-profiling.
All I/O operations are delegated to the boundary layer.

Exports:
    BaseEDAProfiler: Abstract base class for profiler implementations
    YDataProfiler: Main EDA generation class (ydata-profiling backend)
    HTMLExporter: HTML report generation
    SummaryExtractor: Extract structured data from ProfileReport
    EDASummary, EDAResult: Domain models
"""

from backend.core.eda.base import BaseEDAProfiler
from backend.core.eda.profilers import YDataProfiler
from backend.core.eda.helpers import HTMLExporter, SummaryExtractor
from backend.core.eda.models import EDAResult, EDASummary

__all__ = [
    "BaseEDAProfiler",
    "YDataProfiler",
    "HTMLExporter",
    "SummaryExtractor",
    "EDASummary",
    "EDAResult",
]
