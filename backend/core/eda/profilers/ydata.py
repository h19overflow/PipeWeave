"""
EDA profiling using ydata-profiling.

Purpose: Generate exploratory data analysis reports from DataFrames
Layer: Core (Domain Logic)
Dependencies: ydata-profiling, pandas, time
"""

import time
from typing import Optional

import pandas as pd
from ydata_profiling import ProfileReport

from backend.core.eda.base import BaseEDAProfiler
from backend.core.eda.html_exporter import HTMLExporter
from backend.core.eda.models import EDAResult, EDASummary
from backend.configuration.logging import get_logger


logger = get_logger(__name__)


class YDataProfiler(BaseEDAProfiler):
    """
    Generates EDA reports using ydata-profiling library.

    Implements BaseEDAProfiler interface with ydata-profiling backend.
    Wrapper around ProfileReport with standardized configuration
    and result extraction.

    Methods:
        generate_report: Create EDAResult from DataFrame (implements ABC)
        export_to_html: Generate interactive HTML visualization (implements ABC)
    """

    def __init__(
        self,
        minimal: bool = True,
        title: str = "EDA Report",
    ) -> None:
        """
        Initialize profiler configuration.

        Args:
            minimal: Use minimal mode (faster, less detail)
            title: Report title
        """
        self._minimal = minimal
        self._title = title
        self._html_exporter = HTMLExporter(minimal=minimal)

    def generate_report(
        self,
        df: pd.DataFrame,
        title: Optional[str] = None,
    ) -> EDAResult:
        """
        Generate EDA report from DataFrame.

        Args:
            df: Input DataFrame to profile
            title: Report title override

        Returns:
            EDAResult with summary and full report

        Raises:
            ValueError: If DataFrame is empty or invalid
        """
        if df.empty:
            raise ValueError("DataFrame is empty")

        if len(df.columns) == 0:
            raise ValueError("DataFrame has no columns")

        report_title = title or self._title
        logger.info(
            "Starting EDA generation",
            rows=len(df),
            columns=len(df.columns),
            minimal=self._minimal,
        )

        start_time = time.time()

        # Generate profile
        profile = ProfileReport(
            df,
            title=report_title,
            minimal=self._minimal,
            explorative=not self._minimal,
        )

        # Extract report as JSON
        report_json = profile.to_json()

        # Extract summary statistics
        summary = self._extract_summary(df, profile)

        generation_time = time.time() - start_time

        logger.info(
            "EDA generation complete",
            generation_time_seconds=round(generation_time, 2),
            report_size_kb=round(len(str(report_json)) / 1024, 2),
        )

        return EDAResult(
            summary=summary,
            full_report_json=report_json,
            generation_time_seconds=round(generation_time, 2),
            report_version="ydata-profiling-4.0",
        )

    def _extract_summary(
        self,
        df: pd.DataFrame,
        profile: ProfileReport,
    ) -> EDASummary:
        """Extract summary statistics from profile."""
        # Calculate missing percentage
        missing_cells = df.isnull().sum().sum()
        total_cells = df.shape[0] * df.shape[1]
        missing_pct = (missing_cells / total_cells * 100) if total_cells > 0 else 0.0

        # Count duplicate rows
        duplicate_count = df.duplicated().sum()

        # Memory usage
        memory_bytes = df.memory_usage(deep=True).sum()

        return EDASummary(
            num_rows=len(df),
            num_columns=len(df.columns),
            missing_percentage=round(missing_pct, 2),
            duplicate_rows=int(duplicate_count),
            memory_usage_bytes=int(memory_bytes),
        )

    def export_to_html(
        self,
        df: pd.DataFrame,
        title: Optional[str] = None,
    ) -> str:
        """
        Generate interactive HTML report for visualization.

        Implements BaseEDAProfiler.export_to_html().

        Args:
            df: Input DataFrame to analyze
            title: Optional report title override

        Returns:
            HTML string with embedded visualizations

        Raises:
            ValueError: If DataFrame is invalid
        """
        report_title = title or self._title
        return self._html_exporter.export_to_html(df, title=report_title)
