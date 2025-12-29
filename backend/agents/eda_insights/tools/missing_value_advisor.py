"""
Missing value recommendation tool.

This module analyzes missing value patterns and suggests
imputation strategies based on data type and missingness percentage.

Layer: 6 (Agent/Tools)
Dependencies: None (pure logic)
"""

from typing import Dict, Literal


def missing_value_recommendations(
    column_name: str,
    missing_pct: float,
    column_type: str,
    total_rows: int
) -> Dict[str, str]:
    """
    Recommend imputation strategy based on missingness percentage and data type.

    Args:
        column_name: Name of the column with missing values.
        missing_pct: Percentage of missing values (0-100).
        column_type: Column type (numeric, categorical, datetime).
        total_rows: Total number of rows in dataset.

    Returns:
        Dictionary with type, severity, column, message, recommendation.

    Example:
        >>> missing_value_recommendations("Age", 19.9, "numeric", 891)
        {
            "type": "missing_values",
            "severity": "medium",
            "column": "Age",
            "message": "19.9% missing values in 'Age' column (177 of 891 rows)",
            "recommendation": "Use median imputation for robustness or KNN imputation..."
        }
    """
    if missing_pct <= 0:
        # No missing values
        return {
            "type": "missing_values",
            "severity": "low",
            "column": column_name,
            "message": f"No missing values in '{column_name}'",
            "recommendation": "N/A"
        }

    # Calculate missing count
    missing_count = int((missing_pct / 100) * total_rows)

    # Determine severity
    severity: Literal["high", "medium", "low"]
    if missing_pct > 20:
        severity = "high"
    elif missing_pct >= 5:
        severity = "medium"
    else:
        severity = "low"

    # Generate message
    message = (
        f"{missing_pct:.1f}% missing values in '{column_name}' column "
        f"({missing_count} of {total_rows} rows)"
    )

    # Generate recommendation based on type and severity
    if column_type == "numeric":
        if missing_pct > 20:
            recommendation = (
                f"High missingness detected. Use KNN imputation to preserve relationships "
                f"with other features or consider creating a 'missing' indicator feature"
            )
        elif missing_pct >= 5:
            recommendation = (
                f"Use median imputation for robustness or KNN imputation for better accuracy"
            )
        else:
            recommendation = (
                f"Low missingness. Use simple median or mean imputation"
            )

    elif column_type == "categorical":
        if missing_pct > 20:
            recommendation = (
                f"Create a separate 'Missing' category to preserve information about missingness"
            )
        elif missing_pct >= 5:
            recommendation = (
                f"Use mode (most frequent value) imputation or create 'Missing' category"
            )
        else:
            recommendation = (
                f"Low missingness. Use mode imputation or drop rows if acceptable"
            )

    elif column_type == "datetime":
        if missing_pct > 5:
            recommendation = (
                f"Use forward fill for time series data or drop rows if not critical"
            )
        else:
            recommendation = (
                f"Low missingness. Drop rows or use forward/backward fill for time series"
            )

    else:
        # Unknown type
        recommendation = (
            f"Review missing value pattern and decide on imputation strategy based on domain knowledge"
        )

    return {
        "type": "missing_values",
        "severity": severity,
        "column": column_name,
        "message": message,
        "recommendation": recommendation
    }
