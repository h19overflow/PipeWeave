"""
Outlier detection insight tool.

This module analyzes outlier statistics and generates actionable
recommendations for handling extreme values.

Layer: 6 (Agent/Tools)
Dependencies: None (pure logic)
"""

from typing import Dict, List, Literal


def detect_outliers_insight(
    column_name: str,
    outlier_indices: List[int],
    stats: Dict[str, float],
    total_rows: int
) -> Dict[str, str]:
    """
    Generate insight about outliers in numeric column.

    Args:
        column_name: Name of the column with outliers.
        outlier_indices: List of row indices containing outliers.
        stats: Dictionary with mean, std, min, max, q25, q50, q75.
        total_rows: Total number of rows in dataset.

    Returns:
        Dictionary with type, severity, column, message, recommendation.

    Example:
        >>> detect_outliers_insight("Age", [631, 852], {...}, 891)
        {
            "type": "outlier_detection",
            "severity": "low",
            "column": "Age",
            "message": "2 outliers detected in 'Age' column (0.2% of rows)",
            "recommendation": "Use RobustScaler to handle outliers..."
        }
    """
    outlier_count = len(outlier_indices)
    outlier_pct = (outlier_count / total_rows) * 100 if total_rows > 0 else 0.0

    # Determine severity
    severity: Literal["high", "medium", "low"]
    if outlier_pct > 10:
        severity = "high"
    elif outlier_pct >= 1:
        severity = "medium"
    else:
        severity = "low"

    # Generate message
    message = (
        f"{outlier_count} outlier{'s' if outlier_count != 1 else ''} detected in "
        f"'{column_name}' column ({outlier_pct:.1f}% of rows)"
    )

    # Generate recommendation based on severity and stats
    if outlier_pct > 5:
        recommendation = (
            f"Consider removing {outlier_count} outliers if they are clearly anomalous "
            f"or apply log transformation if data is right-skewed"
        )
    elif outlier_pct >= 1:
        recommendation = (
            f"Use RobustScaler to handle outliers while preserving valid extreme values"
        )
    else:
        # Check if distribution is skewed
        if stats.get("mean", 0) > stats.get("q75", 0):
            recommendation = (
                f"Apply log transformation to reduce right skewness and minimize outlier impact"
            )
        else:
            recommendation = (
                f"Outliers are minimal ({outlier_pct:.1f}%). "
                f"Use RobustScaler or leave as-is if valid extreme values"
            )

    return {
        "type": "outlier_detection",
        "severity": severity,
        "column": column_name,
        "message": message,
        "recommendation": recommendation
    }
