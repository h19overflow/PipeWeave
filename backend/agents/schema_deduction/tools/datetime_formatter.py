"""Datetime format detection tool.

Analyzes datetime samples to identify format patterns.
"""

import re
from collections import Counter
from typing import List

from langchain_core.tools import tool


@tool
def suggest_datetime_format(date_samples: List[str]) -> str:
    """Detect datetime format pattern using voting-based regex matching.

    Analyzes datetime samples to identify the most consistent format pattern.
    Supports multiple date/time standards:

    ISO 8601 formats (recommended):
    - YYYY-MM-DD (date only, sortable)
    - YYYY-MM-DDTHH:MM:SS (ISO with time)
    - YYYY-MM-DDTHH:MM:SS+TZ (ISO with timezone)

    Other common formats:
    - YYYY/MM/DD (forward slash separator)
    - MM/DD/YYYY (US date format)
    - DD/MM/YYYY (European date format)
    - DD-MM-YYYY (European with hyphens)
    - YYYY-MM-DD HH:MM:SS (SQL standard)
    - DD/MM/YYYY HH:MM:SS (European with time)
    - Unix Timestamp (seconds since epoch)

    Detection method:
    1. Test each sample against all known format patterns (regex)
    2. Count votes for each format (most matches wins)
    3. Return format with highest vote count (majority voting)
    4. Falls back to "YYYY-MM-DD" if no matches

    Args:
        date_samples: List of datetime string samples (at least 3 recommended)

    Returns:
        Format pattern string (e.g., "YYYY-MM-DD", "MM/DD/YYYY", "Unix Timestamp")
                           This string can be passed to pd.to_datetime(format=...)

    Examples:
        >>> suggest_datetime_format(["2023-01-15", "2023-02-20", "2023-03-10"])
        "YYYY-MM-DD"
        >>> suggest_datetime_format(["01/15/2023", "02/20/2023", "03/10/2023"])
        "MM/DD/YYYY"
        >>> suggest_datetime_format(["2023-01-15T14:30:00", "2023-02-20T09:15:30"])
        "YYYY-MM-DDTHH:MM:SS"
    """
    if not date_samples:
        return "YYYY-MM-DD"  # Default fallback

    # Clean samples
    clean_samples = [str(s).strip() for s in date_samples if s]

    if not clean_samples:
        return "YYYY-MM-DD"

    # Detect format patterns
    format_votes = Counter()

    for sample in clean_samples:
        detected_format = _detect_format(sample)
        if detected_format:
            format_votes[detected_format] += 1

    # Return most common format
    if format_votes:
        return format_votes.most_common(1)[0][0]

    return "YYYY-MM-DD"


def _detect_format(sample: str) -> str:
    """Detect format of a single datetime sample."""
    # ISO 8601 with timezone
    if re.match(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}", sample
    ):
        return "YYYY-MM-DDTHH:MM:SS+TZ"

    # ISO 8601 with seconds
    if re.match(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", sample):
        return "YYYY-MM-DDTHH:MM:SS"

    # ISO 8601 date only
    if re.match(r"\d{4}-\d{2}-\d{2}", sample):
        return "YYYY-MM-DD"

    # YYYY/MM/DD
    if re.match(r"\d{4}/\d{2}/\d{2}", sample):
        return "YYYY/MM/DD"

    # MM/DD/YYYY (US format)
    if re.match(r"\d{2}/\d{2}/\d{4}", sample):
        parts = sample.split("/")
        if len(parts) == 3:
            month = int(parts[0])
            # If month > 12, it's likely DD/MM/YYYY
            if month > 12:
                return "DD/MM/YYYY"
        return "MM/DD/YYYY"

    # DD-MM-YYYY (European format)
    if re.match(r"\d{2}-\d{2}-\d{4}", sample):
        return "DD-MM-YYYY"

    # MM-DD-YYYY
    if re.match(r"\d{2}-\d{2}-\d{4}", sample):
        return "MM-DD-YYYY"

    # YYYY-MM-DD HH:MM:SS (SQL format)
    if re.match(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}", sample):
        return "YYYY-MM-DD HH:MM:SS"

    # DD/MM/YYYY HH:MM:SS
    if re.match(r"\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}", sample):
        return "DD/MM/YYYY HH:MM:SS"

    # Unix timestamp (numeric only)
    if re.match(r"^\d{10,13}$", sample):
        return "Unix Timestamp"

    # Default fallback
    return "YYYY-MM-DD"
