"""Imputation strategy recommendation tool."""

from typing import Literal


def recommend_imputation_strategy(
    column_name: str,
    missing_pct: float,
    data_type: Literal["numeric", "categorical"],
    has_outliers: bool,
) -> str:
    """Recommend optimal imputation strategy based on missingness and column characteristics.

    Selects between 5 imputation approaches based on:
    1. Missingness percentage (severity)
    2. Data type (numeric vs. categorical)
    3. Presence of outliers (robustness)
    4. Information preservation goals

    IMPUTATION STRATEGIES:

    1. "mean" - Simple arithmetic mean
       ├─ Use when: <5% missing, no outliers, numeric column
       ├─ Pros: Fast, unbiased, preserves mean
       └─ Cons: Reduces variance, ignores relationships

    2. "median" - Middle value (robust to outliers)
       ├─ Use when: 5-20% missing with outliers, numeric column
       ├─ Pros: Robust to outliers, preserves distribution shape
       └─ Cons: Ignores relationships with other features

    3. "mode" - Most frequent value
       ├─ Use when: ANY % missing, categorical column
       ├─ Pros: Preserves category distribution
       └─ Cons: Loses missing value information

    4. "knn" - K-Nearest Neighbors imputation
       ├─ Use when: 20-40% missing, numeric column
       ├─ Pros: Preserves relationships with similar rows
       └─ Cons: Computationally expensive, multicollinearity risk

    5. "iterative" - Multiple imputation (e.g., MICE algorithm)
       ├─ Use when: >40% missing, numeric column, relationships matter
       ├─ Pros: Preserves complex relationships, handles high missingness
       └─ Cons: Most computationally expensive, complex tuning

    DECISION LOGIC:

    For NUMERIC columns:
    - 0-5% missing:  mean (if no outliers) or median (if outliers)
    - 5-20% missing: median (preferred for robustness) or mean (if normal dist)
    - 20-40% missing: knn (preserves relationships)
    - >40% missing:   iterative (advanced, full relationship modeling)

    For CATEGORICAL columns:
    - ANY % missing: mode (always)

    Args:
        column_name: Column identifier (for logging/debugging)
        missing_pct: Percentage of missing values (0.0-100.0)
        data_type: Column type ("numeric" or "categorical")
        has_outliers: Boolean indicating presence of extreme values

    Returns:
        Strategy string: "mean" | "median" | "mode" | "knn" | "iterative"
        (Pass to sklearn.impute.SimpleImputer or IterativeImputer)

    Examples:
        >>> recommend_imputation_strategy("age", 2.5, "numeric", False)
        "mean"
        >>> recommend_imputation_strategy("age", 15.0, "numeric", True)
        "median"
        >>> recommend_imputation_strategy("category", 8.0, "categorical", False)
        "mode"
        >>> recommend_imputation_strategy("income", 35.0, "numeric", False)
        "knn"
    """
    if data_type == "categorical":
        return "mode"

    if missing_pct < 5.0:
        return "median" if has_outliers else "mean"

    if 5.0 <= missing_pct <= 20.0:
        return "median" if has_outliers else "mean"

    # missing_pct > 20%: Advanced imputation
    return "knn" if missing_pct < 40.0 else "iterative"
