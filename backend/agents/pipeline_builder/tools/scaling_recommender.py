"""Scaling strategy recommendation tool."""

from typing import Dict


def recommend_scaling_strategy(
    column_stats: Dict[str, float],
    has_outliers: bool,
) -> str:
    """Recommend optimal scaling strategy based on distribution shape and outliers.

    Selects between 4 scaling approaches based on:
    1. Presence of outliers (robustness requirement)
    2. Skewness of distribution (transformation need)
    3. Model algorithm sensitivity

    SCALING STRATEGIES:

    1. "standard" - StandardScaler (Z-score normalization)
       ├─ Formula: (X - mean) / std
       ├─ Use when: Normal/symmetric distribution, no outliers
       ├─ Pros: Centering at 0, variance=1, interpretable coefficients
       ├─ Cons: Sensitive to outliers, not bounded
       └─ Models: Linear regression, logistic regression, SVM, neural networks

    2. "robust" - RobustScaler (quantile-based)
       ├─ Formula: (X - Q2) / (Q3 - Q1)  # median / IQR
       ├─ Use when: Outliers present, skewed distribution
       ├─ Pros: Robust to outliers, handles skewness better
       ├─ Cons: Less interpretable, output not centered
       └─ Models: Robust to outlier-sensitive algorithms

    3. "minmax" - MinMaxScaler (range normalization)
       ├─ Formula: (X - min) / (max - min)  → bounded [0, 1]
       ├─ Use when: Bounded features required, distribution-agnostic
       ├─ Pros: Bounded output [0, 1], preserves zero values
       ├─ Cons: Sensitive to outliers, changes scale of values
       └─ Models: Neural networks, KNN, decision trees (when scaled)

    4. "log_transform" - Log transformation then StandardScaler
       ├─ Formula: log(X + 1) then standard scale (handles zero/negative)
       ├─ Use when: Severe right skewness (skewness > 2.0)
       ├─ Pros: Reduces skewness, stabilizes variance for time-series
       ├─ Cons: Only for positive values, loses interpretability
       └─ Models: Linear models, when skewness hurts assumptions

    DISTRIBUTION CHARACTERISTICS:

    Skewness interpretation:
    - |skewness| < 0.5: Approximately symmetric → "standard"
    - 0.5 < |skewness| < 2.0: Moderately skewed → "standard" or "robust"
    - |skewness| > 2.0: Highly right-skewed → "log_transform"

    DECISION LOGIC:

    1. IF outliers_present:
       → RETURN "robust"  (RobustScaler handles outliers)

    2. ELSE IF |skewness| > 2.0:
       → RETURN "log_transform"  (Reduce severe skewness)

    3. ELSE IF |skewness| < 0.5:
       → RETURN "standard"  (Symmetric, use standard scaling)

    4. DEFAULT:
       → RETURN "standard"  (Handle moderate skewness)

    Args:
        column_stats: Dictionary with distribution metrics including:
                     - "skewness": float (from scipy.stats.skew)
                     - "mean": float
                     - "std": float
        has_outliers: Boolean indicating IQR-based outlier detection

    Returns:
        Strategy string: "standard" | "robust" | "minmax" | "log_transform"
        (Pass to sklearn.preprocessing scaling classes)

    Examples:
        >>> recommend_scaling_strategy({"skewness": 0.3}, False)
        "standard"
        >>> recommend_scaling_strategy({"skewness": 0.3}, True)
        "robust"
        >>> recommend_scaling_strategy({"skewness": 2.5}, False)
        "log_transform"
    """
    if has_outliers:
        return "robust"

    skewness = abs(column_stats.get("skewness", 0.0))

    if skewness < 0.5:
        return "standard"

    if skewness > 2.0:
        return "log_transform"

    return "standard"
