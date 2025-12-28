"""
Preprocessing Core Module - Data preparation and feature engineering.

Exports:
    BaseColumnDetector: Abstract base for column type detection
    BasePreprocessor: Abstract base for preprocessing pipelines
    ColumnDetector: Concrete column type detection
    FixedPreprocessor: Concrete fixed preprocessing pipeline
    ColumnInfo: Domain model for column information
"""

from backend.core.preprocessing.base import BaseColumnDetector, BasePreprocessor
from backend.core.preprocessing.detectors import ColumnDetector
from backend.core.preprocessing.pipeline_processors import FixedPreprocessor
from backend.core.preprocessing.models import ColumnInfo

__all__ = [
    "BaseColumnDetector",
    "BasePreprocessor",
    "ColumnDetector",
    "FixedPreprocessor",
    "ColumnInfo",
]
