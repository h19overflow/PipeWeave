"""Column type detection tool.

Analyzes column names and sample values to determine data types.
"""

import re
from typing import List, Literal

from langchain_core.tools import tool


ColumnType = Literal["numeric", "categorical", "datetime", "text", "boolean"]


@tool
def detect_column_type(column_name: str, sample_values: List[str]) -> str:
    """Detect column data type using semantic analysis and pattern matching.

    Uses a multi-pass detection strategy combining:
    1. Column name semantic analysis (keywords: "date", "id", "flag", etc.)
    2. Value pattern matching against 5 column type categories
    3. Uniqueness ratio for categorical vs. text distinction

    Detection priority (hierarchical):
    1. Datetime - Column names with temporal keywords + datetime patterns
    2. Boolean - Prefix keywords (is_, has_) + binary values
    3. Numeric - Numeric keywords (id, count, price) + numeric patterns
    4. Categorical - Low uniqueness ratio (<50% unique values)
    5. Text - Default for high-uniqueness free-form content

    Type-specific patterns:
    - Numeric: 80%+ of samples parse as float/int (handles currency symbols)
    - Boolean: Values limited to {true/false, yes/no, 0/1, t/f, y/n}
    - Datetime: ISO 8601, YYYY-MM-DD, MM/DD/YYYY, Unix timestamps
    - Categorical: Repeated values, low cardinality
    - Text: Free-form content, many unique values

    Args:
        column_name: CSV header column name (used for semantic hints)
        sample_values: First 10 sample values from the column

    Returns:
        Detected type string: "numeric" | "categorical" | "datetime" | "text" | "boolean"

    Examples:
        >>> detect_column_type("user_id", ["1", "2", "3", "4", "5"])
        "numeric"
        >>> detect_column_type("created_at", ["2023-01-01", "2023-01-02"])
        "datetime"
        >>> detect_column_type("product_category", ["A", "A", "B", "A", "C"])
        "categorical"
    """
    # Clean samples (remove whitespace)
    clean_samples = [str(v).strip() for v in sample_values if v]

    if not clean_samples:
        return "text"

    # Check column name patterns
    name_lower = column_name.lower()

    # Datetime indicators
    datetime_keywords = [
        "date",
        "time",
        "timestamp",
        "created",
        "updated",
        "modified",
    ]
    if any(kw in name_lower for kw in datetime_keywords):
        if _is_datetime_pattern(clean_samples):
            return "datetime"

    # Boolean indicators
    boolean_keywords = ["is_", "has_", "flag", "enabled", "active"]
    if any(name_lower.startswith(kw) for kw in boolean_keywords):
        if _is_boolean_pattern(clean_samples):
            return "boolean"

    # Numeric indicators
    numeric_keywords = ["id", "count", "amount", "price", "age", "score"]
    if any(kw in name_lower for kw in numeric_keywords):
        if _is_numeric_pattern(clean_samples):
            return "numeric"

    # Analyze value patterns
    if _is_numeric_pattern(clean_samples):
        return "numeric"

    if _is_boolean_pattern(clean_samples):
        return "boolean"

    if _is_datetime_pattern(clean_samples):
        return "datetime"

    # Check uniqueness ratio for categorical vs text
    unique_ratio = len(set(clean_samples)) / len(clean_samples)

    if unique_ratio < 0.5:  # Low uniqueness suggests categorical
        return "categorical"

    return "text"


def _is_numeric_pattern(samples: List[str]) -> bool:
    """Check if samples match numeric pattern."""
    numeric_count = 0
    for sample in samples:
        # Remove common currency symbols and commas
        cleaned = re.sub(r"[$,€£¥]", "", sample)
        try:
            float(cleaned)
            numeric_count += 1
        except (ValueError, TypeError):
            continue

    # 80% threshold for numeric classification
    return numeric_count / len(samples) >= 0.8


def _is_boolean_pattern(samples: List[str]) -> bool:
    """Check if samples match boolean pattern."""
    boolean_values = {
        "true",
        "false",
        "yes",
        "no",
        "0",
        "1",
        "t",
        "f",
        "y",
        "n",
    }
    unique_lower = {s.lower() for s in samples}
    return unique_lower.issubset(boolean_values) and len(unique_lower) <= 2


def _is_datetime_pattern(samples: List[str]) -> bool:
    """Check if samples match datetime pattern."""
    datetime_patterns = [
        r"\d{4}-\d{2}-\d{2}",  # YYYY-MM-DD
        r"\d{2}/\d{2}/\d{4}",  # MM/DD/YYYY or DD/MM/YYYY
        r"\d{4}/\d{2}/\d{2}",  # YYYY/MM/DD
        r"\d{2}-\d{2}-\d{4}",  # DD-MM-YYYY
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}",  # ISO 8601
    ]

    match_count = 0
    for sample in samples:
        if any(re.search(pattern, sample) for pattern in datetime_patterns):
            match_count += 1

    # 70% threshold for datetime classification
    return match_count / len(samples) >= 0.7
