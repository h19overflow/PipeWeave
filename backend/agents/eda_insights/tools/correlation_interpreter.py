"""
Correlation interpretation tool.

This module identifies strong correlations between features
and suggests feature engineering or selection strategies.

Layer: 6 (Agent/Tools)
Dependencies: None (pure logic)
"""

from typing import Dict, List, Literal


def interpret_correlations(
    correlation_matrix: Dict[str, Dict[str, float]],
    threshold: float = 0.7
) -> List[Dict[str, str]]:
    """
    Find strong correlations (|r| > threshold) and generate insights.

    Args:
        correlation_matrix: Nested dict mapping feature pairs to correlation values.
        threshold: Minimum absolute correlation to report (default: 0.7).

    Returns:
        List of correlation insights with feature pairs and recommendations.

    Example:
        >>> interpret_correlations({"Fare": {"Pclass": -0.55, "Age": 0.1}})
        [
            {
                "type": "correlation",
                "severity": "medium",
                "columns": ["Fare", "Pclass"],
                "message": "Moderate negative correlation (-0.55) between 'Fare' and 'Pclass'",
                "recommendation": "Monitor for multicollinearity..."
            }
        ]
    """
    insights: List[Dict[str, str]] = []
    processed_pairs = set()

    for col1, correlations in correlation_matrix.items():
        for col2, corr_value in correlations.items():
            # Skip self-correlation and already processed pairs
            if col1 == col2:
                continue

            pair_key = tuple(sorted([col1, col2]))
            if pair_key in processed_pairs:
                continue

            processed_pairs.add(pair_key)

            # Check if correlation exceeds threshold
            abs_corr = abs(corr_value)

            if abs_corr < 0.5:
                # Weak correlation, skip
                continue

            # Determine severity
            severity: Literal["high", "medium", "low"]
            if abs_corr >= threshold:
                severity = "medium"  # Strong correlation is medium severity
            else:
                severity = "low"  # Moderate correlation

            # Generate message
            corr_type = "positive" if corr_value > 0 else "negative"
            if abs_corr >= threshold:
                strength = "Strong"
            else:
                strength = "Moderate"

            message = (
                f"{strength} {corr_type} correlation ({corr_value:.2f}) "
                f"between '{col1}' and '{col2}'"
            )

            # Generate recommendation
            if abs_corr >= threshold:
                recommendation = (
                    f"Features '{col1}' and '{col2}' are highly correlated. "
                    f"Consider removing one to reduce multicollinearity or apply PCA if model shows high variance"
                )
            else:
                recommendation = (
                    f"Monitor '{col1}' and '{col2}' for multicollinearity. "
                    f"May use PCA or feature selection if model overfits"
                )

            insights.append({
                "type": "correlation",
                "severity": severity,
                "columns": [col1, col2],
                "message": message,
                "recommendation": recommendation
            })

    return insights
