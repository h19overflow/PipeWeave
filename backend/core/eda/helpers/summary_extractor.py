"""
Summary extraction from ydata-profiling reports.

Purpose: Extract structured summary statistics from ProfileReport
Layer: Core (Business Logic)
Dependencies: pandas, ydata_profiling

This module handles the complex internal structure of ydata-profiling
and converts it to our domain models.
"""

import pandas as pd
from ydata_profiling import ProfileReport

from backend.core.eda.models import EDASummary


class SummaryExtractor:
    """
    Extract structured data from ydata-profiling ProfileReport.

    This class handles the internal structure of ProfileReport objects
    and converts them to our domain models (EDASummary).

    Example:
        extractor = SummaryExtractor()
        summary = extractor.extract_summary(profile, df)
    """

    def extract_summary(
        self,
        profile: ProfileReport,
        df: pd.DataFrame,
    ) -> EDASummary:
        """
        Extract high-level summary statistics.

        Args:
            profile: Generated ProfileReport from ydata-profiling
            df: Original DataFrame (for memory calculation)

        Returns:
            EDASummary with dataset-level statistics

        Raises:
            ValueError: If profile is invalid or missing required fields
        """
        try:
            description = profile.get_description()
            table = description.get("table", {})
        except Exception as e:
            raise ValueError(f"Invalid ProfileReport structure: {e}") from e

        return EDASummary(
            num_rows=table.get("n", len(df)),
            num_columns=table.get("n_var", len(df.columns)),
            missing_percentage=table.get("p_cells_missing", 0.0) * 100,
            duplicate_rows=table.get("n_duplicates", 0),
            memory_usage_bytes=int(df.memory_usage(deep=True).sum()),
        )
