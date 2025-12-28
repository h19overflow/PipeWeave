"""
HTML export for ydata-profiling reports.

Purpose: Generate interactive HTML reports for preview/download
Layer: Core (Domain Logic)
Dependencies: ydata-profiling, pandas
"""

from typing import Optional

import pandas as pd
from ydata_profiling import ProfileReport

from backend.configuration.logging import get_logger


logger = get_logger(__name__)


class HTMLExporter:
    """
    Export ydata-profiling reports to interactive HTML.

    This handles the HTML generation for frontend visualization.
    Separate from the main profiler to keep concerns isolated.

    Example:
        exporter = HTMLExporter(minimal=True)
        html = exporter.export_to_html(df, title="My Report")
    """

    def __init__(
        self,
        minimal: bool = True,
    ) -> None:
        """
        Initialize HTML exporter configuration.

        Args:
            minimal: Use minimal mode (faster, less detail)
        """
        self._minimal = minimal

    def export_to_html(
        self,
        df: pd.DataFrame,
        title: str = "EDA Report",
    ) -> str:
        """
        Generate interactive HTML report.

        Args:
            df: Input DataFrame to analyze
            title: Report title

        Returns:
            HTML string with embedded visualizations

        Raises:
            ValueError: If DataFrame is empty or invalid
        """
        if df.empty:
            raise ValueError("DataFrame is empty")

        if len(df.columns) == 0:
            raise ValueError("DataFrame has no columns")

        logger.info(
            "Generating HTML report",
            rows=len(df),
            columns=len(df.columns),
            minimal=self._minimal,
        )

        # Generate profile
        profile = ProfileReport(
            df,
            title=title,
            minimal=self._minimal,
            explorative=not self._minimal,
        )

        # Export to HTML
        html_str = profile.to_html()

        logger.info(
            "HTML report generated",
            html_size_kb=round(len(html_str) / 1024, 2),
        )

        return html_str
