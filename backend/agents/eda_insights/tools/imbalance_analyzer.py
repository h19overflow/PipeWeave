"""
Class imbalance analysis tool.

This module detects class imbalance in categorical columns
and suggests mitigation strategies.

Layer: 6 (Agent/Tools)
Dependencies: None (pure logic)
"""

from typing import Dict, Literal


def analyze_class_imbalance(
    column_name: str,
    value_counts: Dict[str, int]
) -> Dict[str, str]:
    """
    Detect class imbalance and recommend techniques.

    Args:
        column_name: Name of the categorical column.
        value_counts: Dictionary mapping category values to their frequencies.

    Returns:
        Dictionary with type, severity, column, message, recommendation.

    Example:
        >>> analyze_class_imbalance("Survived", {"0": 549, "1": 342})
        {
            "type": "class_imbalance",
            "severity": "medium",
            "column": "Survived",
            "message": "Class imbalance detected: 61.6% class 0, 38.4% class 1...",
            "recommendation": "Consider SMOTE oversampling or class_weight='balanced'..."
        }
    """
    if not value_counts or len(value_counts) < 2:
        # Not applicable for single-class or empty columns
        return {
            "type": "class_imbalance",
            "severity": "low",
            "column": column_name,
            "message": f"Column '{column_name}' has {len(value_counts)} class(es). No imbalance analysis needed.",
            "recommendation": "N/A"
        }

    # Calculate total and percentages
    total = sum(value_counts.values())
    sorted_counts = sorted(value_counts.items(), key=lambda x: x[1], reverse=True)
    majority_class, majority_count = sorted_counts[0]
    minority_class, minority_count = sorted_counts[-1]

    majority_pct = (majority_count / total) * 100
    minority_pct = (minority_count / total) * 100
    ratio = majority_count / minority_count if minority_count > 0 else float('inf')

    # Determine severity based on imbalance ratio
    severity: Literal["high", "medium", "low"]
    if ratio > 10:
        severity = "high"
    elif ratio >= 3:
        severity = "medium"
    elif ratio >= 1.5:
        severity = "low"
    else:
        # Balanced
        return {
            "type": "class_imbalance",
            "severity": "low",
            "column": column_name,
            "message": f"Column '{column_name}' is balanced (ratio {ratio:.1f}:1)",
            "recommendation": "No action needed. Classes are well balanced."
        }

    # Generate message
    message = (
        f"Class imbalance detected in '{column_name}': "
        f"{majority_pct:.1f}% class '{majority_class}', "
        f"{minority_pct:.1f}% class '{minority_class}' "
        f"(ratio {ratio:.1f}:1)"
    )

    # Generate recommendation based on severity
    if ratio > 10:
        recommendation = (
            f"Severe imbalance detected. Apply SMOTE oversampling combined with "
            f"ensemble methods (e.g., BalancedRandomForest) or consider anomaly detection"
        )
    elif ratio >= 3:
        recommendation = (
            f"Use SMOTE oversampling to balance classes or apply undersampling "
            f"to reduce majority class if dataset is large"
        )
    else:
        recommendation = (
            f"Mild imbalance. Use class_weight='balanced' in model training "
            f"(e.g., RandomForest, LogisticRegression)"
        )

    return {
        "type": "class_imbalance",
        "severity": severity,
        "column": column_name,
        "message": message,
        "recommendation": recommendation
    }
