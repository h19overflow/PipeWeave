"""Encoding strategy recommendation tool."""


def recommend_encoding_strategy(
    unique_values: int,
    target_correlation: float,
) -> str:
    """Recommend optimal categorical encoding strategy based on cardinality and target relationship.

    Selects between 4 encoding approaches based on:
    1. Cardinality (number of unique categories)
    2. Target correlation (predictive strength)
    3. Model algorithm requirements

    ENCODING STRATEGIES:

    1. "onehot" - One-Hot Encoding (binary vectors)
       ├─ Process: Create binary column for each category (except one)
       ├─ Use when: <10 categories, tree-based models, or low cardinality
       ├─ Pros: Model-agnostic, handles new categories easily, sparse representation
       ├─ Cons: Curse of dimensionality (high cardinality → many features)
       ├─ Output shape: N_samples × N_categories
       └─ Models: Linear models, SVM, neural networks, trees (sometimes)

    2. "target" - Target Encoding (mean-target encoding)
       ├─ Process: Replace category with mean target value in that category
       ├─ Use when: 10-50+ categories with strong target correlation (|r| > 0.3)
       ├─ Pros: Reduces dimensionality, captures target relationship
       ├─ Cons: Risk of target leakage (mitigate with cross-validation)
       ├─ Output shape: N_samples × 1 (numeric)
       └─ Models: Boosting (XGBoost, LightGBM), tree-based, linear

    3. "ordinal" - Ordinal Encoding (sequential integers)
       ├─ Process: Assign 0, 1, 2, ... to categories
       ├─ Use when: Categories have natural order (e.g., "low", "medium", "high")
       ├─ Pros: Minimal output features, preserves ordinality
       ├─ Cons: Implies ordering where none exists (problematic for unordered)
       ├─ Output shape: N_samples × 1 (numeric)
       └─ Models: Tree-based, ordinal regression

    4. "hash" - Hashing Encoder (fixed-size hash)
       ├─ Process: Hash category names to fixed number of buckets
       ├─ Use when: Very high cardinality (>100 categories)
       ├─ Pros: Fixed output dimension, handles unknown categories
       ├─ Cons: Hash collisions possible, information loss
       ├─ Output shape: N_samples × N_hash_buckets (typically 8-256)
       └─ Models: Neural networks, text-like feature processing

    CARDINALITY THRESHOLDS:

    Low cardinality (<10):
    ├─ OneHot dominates (manageable feature expansion)
    └─ Example: brand (A, B, C, ...), color (red, blue, green)

    Medium cardinality (10-50):
    ├─ OneHot (if low memory): Creates 10-50 features
    ├─ TargetEncoder (if high correlation): Captures target relationship
    └─ Decision: Depends on target correlation strength

    High cardinality (>50):
    ├─ OneHot: Impractical (100+ features)
    ├─ TargetEncoder: Recommended if strong target correlation
    ├─ Hash: Recommended for extreme cardinality (>1000)
    └─ Decision: Balance feature reduction vs. information loss

    TARGET CORRELATION DECISION:

    - |r| > 0.3: Feature is predictive of target
      └─ Prefer TargetEncoder (preserves predictive signal)

    - |r| ≤ 0.3: Feature is NOT predictive
      └─ Prefer OneHotEncoder (avoids overfitting on noise)

    DECISION LOGIC:

    1. IF unique_values < 10:
       → RETURN "onehot"  (Low cardinality, manageable feature explosion)

    2. ELIF unique_values 10-50:
       → IF |target_correlation| > 0.3:
          → RETURN "target"  (Capture target relationship)
          ELSE:
          → RETURN "onehot"  (Avoid overfitting on weak signal)

    3. ELSE (unique_values > 50):
       → IF unique_values > 100:
          → RETURN "hash"  (Extreme cardinality, fixed-size hashing)
          ELSE:
          → RETURN "target"  (Medium-high cardinality, use target encoding)

    Args:
        unique_values: Number of distinct categories in the column (cardinality)
        target_correlation: Pearson correlation between category and target
                           (absolute value, 0.0-1.0 range)

    Returns:
        Strategy string: "onehot" | "target" | "hash" | "ordinal"
        (Pass to sklearn.preprocessing or category_encoders)

    Examples:
        >>> recommend_encoding_strategy(5, 0.2)
        "onehot"
        >>> recommend_encoding_strategy(25, 0.45)
        "target"
        >>> recommend_encoding_strategy(25, 0.1)
        "onehot"
        >>> recommend_encoding_strategy(150, 0.35)
        "hash"
    """
    if unique_values < 10:
        return "onehot"

    if 10 <= unique_values <= 50:
        return "target" if abs(target_correlation) > 0.3 else "onehot"

    # High cardinality (>50)
    return "hash" if unique_values > 100 else "target"
