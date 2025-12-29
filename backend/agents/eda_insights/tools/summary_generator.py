"""
Summary recommendation generator.

This module synthesizes all insights into a high-level action plan,
prioritizing the most critical data quality issues.

Layer: 6 (Agent/Tools)
Dependencies: None (pure logic)
"""

from typing import List, Dict


def generate_summary_recommendation(insights: List[Dict[str, str]]) -> str:
    """
    Create executive summary of top 3 most critical data quality issues.

    Args:
        insights: List of insight dictionaries with severity, type, column, message.

    Returns:
        Single-sentence recommendation prioritizing actions.

    Example:
        >>> insights = [
        ...     {"severity": "high", "type": "missing_values", "column": "Age", ...},
        ...     {"severity": "medium", "type": "class_imbalance", "column": "Survived", ...}
        ... ]
        >>> generate_summary_recommendation(insights)
        "Focus on handling 19.9% missing values in 'Age' and addressing class imbalance..."
    """
    if not insights:
        return "No significant data quality issues detected. Dataset is ready for modeling."

    # Sort by severity (high -> medium -> low)
    severity_order = {"high": 0, "medium": 1, "low": 2}
    sorted_insights = sorted(
        insights,
        key=lambda x: severity_order.get(x.get("severity", "low"), 3)
    )

    # Extract top 3 most critical issues
    top_issues = sorted_insights[:3]

    # Count high-severity issues
    high_count = sum(1 for i in insights if i.get("severity") == "high")
    medium_count = sum(1 for i in insights if i.get("severity") == "medium")

    # Build summary based on top issues
    if high_count == 0 and medium_count == 0:
        return (
            "Only minor data quality issues detected. "
            "Dataset is in good condition for modeling."
        )

    summary_parts = []

    for insight in top_issues:
        issue_type = insight.get("type", "")
        column = insight.get("column", "")
        severity = insight.get("severity", "")

        if issue_type == "missing_values" and column:
            # Extract percentage from message if available
            message = insight.get("message", "")
            if "%" in message:
                pct = message.split("%")[0].split()[-1]
                summary_parts.append(f"handling {pct}% missing values in '{column}'")
            else:
                summary_parts.append(f"handling missing values in '{column}'")

        elif issue_type == "class_imbalance" and column:
            summary_parts.append(f"addressing class imbalance in '{column}'")

        elif issue_type == "outlier_detection" and column:
            summary_parts.append(f"handling outliers in '{column}'")

        elif issue_type == "correlation":
            columns = insight.get("columns", [])
            if len(columns) == 2:
                summary_parts.append(f"addressing correlation between '{columns[0]}' and '{columns[1]}'")

    if not summary_parts:
        return "Review identified data quality issues before proceeding to modeling."

    # Construct final summary
    if len(summary_parts) == 1:
        summary = f"Focus on {summary_parts[0]} before training."
    elif len(summary_parts) == 2:
        summary = f"Focus on {summary_parts[0]} and {summary_parts[1]} before training."
    else:
        summary = (
            f"Focus on {summary_parts[0]}, {summary_parts[1]}, "
            f"and {summary_parts[2]} before training."
        )

    # Add overall severity context
    if high_count > 0:
        summary += f" ({high_count} high-severity issue{'s' if high_count != 1 else ''} detected)"

    return summary
