"""
Column Type Detector.

Detects column types (numeric/categorical/text/datetime/boolean) for preprocessing.
Pure logic - no I/O operations.
"""

from dataclasses import dataclass
from typing import Literal, override

import pandas as pd

from backend.core.preprocessing.base import BaseColumnDetector


ColumnType = Literal["numeric", "categorical", "datetime", "text", "boolean"]


@dataclass
class ColumnInfo:
    """Column metadata: type, missing values, unique count, target candidacy."""

    name: str
    dtype: ColumnType
    missing_count: int
    unique_count: int
    is_target_candidate: bool


class ColumnDetector(BaseColumnDetector):
    """
    Detects column types for preprocessing pipeline.

    Logic: numeric (int/float), categorical (object <20 unique), text (object >20),
    datetime (datetime64), boolean (bool). Target candidates: categorical 2-10 unique
    or numeric.
    """

    def __init__(
        self,
        categorical_threshold: int = 20,
        text_threshold: int = 100,
    ) -> None:
        self._cat_threshold = categorical_threshold
        self._text_threshold = text_threshold

    @override
    def detect_all(self, df: pd.DataFrame) -> list[ColumnInfo]:
        """Detect types for all columns."""
        return [self.detect_column(df, col) for col in df.columns]

    @override
    def detect_column(self, df: pd.DataFrame, column: str) -> ColumnInfo:
        """Detect type for single column."""
        series = df[column]
        missing = series.isna().sum()
        unique = series.nunique()

        dtype = self._infer_type(series, unique)
        is_target = self._is_target_candidate(series, dtype, unique)

        return ColumnInfo(
            name=column,
            dtype=dtype,
            missing_count=int(missing),
            unique_count=int(unique),
            is_target_candidate=is_target,
        )

    @override
    def get_numeric_columns(self, df: pd.DataFrame) -> list[str]:
        """Get numeric column names."""
        infos = self.detect_all(df)
        return [info.name for info in infos if info.dtype == "numeric"]

    @override
    def get_categorical_columns(self, df: pd.DataFrame) -> list[str]:
        """Get categorical column names."""
        infos = self.detect_all(df)
        return [info.name for info in infos if info.dtype == "categorical"]

    def _infer_type(self, series: pd.Series, unique: int) -> ColumnType:
        """Infer column type from pandas dtype and cardinality."""
        dtype = series.dtype

        if pd.api.types.is_bool_dtype(dtype):
            return "boolean"
        if pd.api.types.is_datetime64_any_dtype(dtype):
            return "datetime"
        if pd.api.types.is_numeric_dtype(dtype):
            return "numeric"
        if pd.api.types.is_categorical_dtype(dtype):
            return "categorical"

        # Object type - determine if categorical or text
        if dtype == object:
            if unique <= self._cat_threshold:
                return "categorical"
            return "text"

        return "text"

    def _is_target_candidate(
        self,
        series: pd.Series,
        dtype: ColumnType,
        unique: int,
    ) -> bool:
        """Check if column could be a target variable."""
        if dtype == "categorical" and 2 <= unique <= 10:
            return True  # Classification target
        if dtype == "numeric":
            return True  # Regression target
        return False
