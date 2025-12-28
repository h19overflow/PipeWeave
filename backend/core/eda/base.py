"""
Abstract base classes for EDA profilers.

Purpose: Define interface contract for EDA profiler implementations
Layer: Core (Domain Logic)
Dependencies: abc, typing, pandas

This module provides the abstract interface that all EDA profiler
implementations must follow. This enables:
- Pluggable profilers (ydata-profiling, pandas-profiling, custom)
- Clear separation of concerns
- Testable mock implementations
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

import pandas as pd

from backend.core.eda.models import EDAResult


class BaseEDAProfiler(ABC):
    """
    Abstract base class for all EDA profiler implementations.

    Any EDA profiler (ydata-profiling, pandas-profiling, custom, etc.)
    must inherit from this class and implement all abstract methods.

    The workflow follows this pattern:
    1. generate_report() - Generate profile object from DataFrame
    2. extract_summary() - Extract lightweight summary for database storage
    3. export_to_json() - Export full report for storage (PostgreSQL or S3)
    4. export_to_html() - Export interactive HTML report for visualization

    Example:
        class CustomProfiler(BaseEDAProfiler):
            def generate_report(self, df: pd.DataFrame, title: Optional[str]) -> EDAResult:
                # Custom implementation
                ...

        profiler = CustomProfiler()
        result = profiler.generate_report(df)
    """

    @abstractmethod
    def generate_report(
        self,
        df: pd.DataFrame,
        title: Optional[str] = None,
    ) -> EDAResult:
        """
        Generate complete EDA report from DataFrame.

        This is the main entry point for EDA generation. It must:
        - Validate the DataFrame
        - Generate profile analysis
        - Extract summary statistics
        - Return structured EDAResult

        Args:
            df: Input DataFrame to analyze
            title: Optional report title (overrides default)

        Returns:
            EDAResult containing summary and full report

        Raises:
            ValueError: If DataFrame is empty, has no columns, or invalid
        """
        pass

    @abstractmethod
    def export_to_html(
        self,
        df: pd.DataFrame,
        title: Optional[str] = None,
    ) -> str:
        """
        Generate interactive HTML report for visualization.

        This is used for preview/download functionality in the frontend.

        Args:
            df: Input DataFrame to analyze
            title: Optional report title

        Returns:
            HTML string with embedded visualizations

        Raises:
            ValueError: If DataFrame is invalid
        """
        pass
