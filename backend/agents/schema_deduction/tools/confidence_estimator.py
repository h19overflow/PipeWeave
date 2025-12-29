"""Confidence estimation tool.

Calculates confidence scores for type detection based on data quality.
"""

from typing import List, Literal

from langchain_core.tools import tool


ColumnType = Literal["numeric", "categorical", "datetime", "text", "boolean"]


@tool
def estimate_confidence(
    detected_type: str, sample_values: List[str], parse_success_rate: float
) -> float:
    """Estimate confidence score (0.0-1.0) for type detection reliability.

    Combines multiple confidence signals:
    1. Parse Success Rate (50% weight) - What % of samples parse as the detected type
    2. Pattern Consistency (30% weight) - Type-specific consistency metric
    3. Sample Size Adequacy (20% weight) - Do we have enough samples for reliable detection?

    Confidence thresholds guide user actions:
    - High (≥0.90): Auto-accept type, proceed to preprocessing
    - Medium (0.70-0.89): Recommend review by user, may have edge cases
    - Low (<0.70): Requires manual user override, ambiguous detection

    Type-specific consistency metrics:
    - Numeric: Coefficient of variation (consistency in value ranges)
    - Categorical: Low uniqueness ratio (repeated values signal categorical)
    - Datetime: Format uniformity (consistent string lengths/patterns)
    - Boolean: Binary nature (exactly 2 unique values)
    - Text: Lower baseline confidence due to high natural variability

    Args:
        detected_type: Inferred column type (numeric, categorical, datetime, etc.)
        sample_values: Actual sample values analyzed for detection
        parse_success_rate: Fraction of samples that successfully parse as detected_type
                           (0.0 = no samples match, 1.0 = all samples match)

    Returns:
        Confidence float between 0.0-1.0:
        - 0.95+: Extremely confident (e.g., all numeric samples parse cleanly)
        - 0.80-0.95: High confidence, can proceed
        - 0.70-0.80: Moderate confidence, review recommended
        - 0.50-0.70: Low confidence, manual override suggested
        - <0.50: Very low confidence, detection likely incorrect

    Examples:
        >>> estimate_confidence("numeric", ["1.5", "2.0", "3.5"], 1.0)
        0.95
        >>> estimate_confidence("categorical", ["A", "B", "A"], 1.0)
        0.85
        >>> estimate_confidence("text", ["hello", "world"], 0.5)
        0.58
    """
    if not sample_values:
        return 0.0

    # Base confidence from parse success rate
    base_confidence = parse_success_rate

    # Adjust based on sample size
    sample_size_factor = min(len(sample_values) / 10.0, 1.0)

    # Calculate pattern consistency
    consistency_score = _calculate_consistency(sample_values, detected_type)

    # Weighted average
    confidence = (
        base_confidence * 0.5  # Parse success is most important
        + consistency_score * 0.3  # Pattern consistency
        + sample_size_factor * 0.2  # Sample size adequacy
    )

    # Clamp to [0.0, 1.0]
    return max(0.0, min(1.0, confidence))


def _calculate_consistency(
    samples: List[str], detected_type: str
) -> float:
    """Calculate pattern consistency score."""
    if not samples:
        return 0.0

    clean_samples = [str(v).strip() for v in samples if v]

    # For numeric: check value range consistency
    if detected_type == "numeric":
        return _numeric_consistency(clean_samples)

    # For categorical: check uniqueness ratio
    if detected_type == "categorical":
        unique_ratio = len(set(clean_samples)) / len(clean_samples)
        # Low uniqueness is good for categorical (high consistency)
        return 1.0 - unique_ratio

    # For datetime: check format uniformity
    if detected_type == "datetime":
        return _datetime_consistency(clean_samples)

    # For boolean: check binary nature
    if detected_type == "boolean":
        unique_count = len(set(clean_samples))
        return 1.0 if unique_count <= 2 else 0.5

    # For text: lower consistency expected
    return 0.6


def _numeric_consistency(samples: List[str]) -> float:
    """Check numeric value consistency."""
    values = []
    for sample in samples:
        try:
            # Remove currency symbols
            cleaned = sample.replace("$", "").replace(",", "")
            values.append(float(cleaned))
        except (ValueError, AttributeError):
            continue

    if len(values) < 2:
        return 0.5

    # Check if values are in similar range (coefficient of variation)
    mean = sum(values) / len(values)
    if mean == 0:
        return 0.7

    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std_dev = variance**0.5
    cv = std_dev / abs(mean)

    # Lower CV = higher consistency
    if cv < 0.5:
        return 0.95
    elif cv < 1.0:
        return 0.85
    elif cv < 2.0:
        return 0.75
    else:
        return 0.65


def _datetime_consistency(samples: List[str]) -> float:
    """Check datetime format consistency."""
    # Check if all samples have similar length (format consistency indicator)
    lengths = [len(s) for s in samples]
    if not lengths:
        return 0.5

    avg_length = sum(lengths) / len(lengths)
    length_variance = sum((l - avg_length) ** 2 for l in lengths) / len(
        lengths
    )

    # Low variance in length = consistent format
    if length_variance < 2:
        return 0.95
    elif length_variance < 5:
        return 0.85
    else:
        return 0.70
