"""
Abstract Base Classes for Preprocessing Module.

Defines contracts for column detection and preprocessing strategies.
Layer: 3 (Business Logic)
"""

from abc import ABC, abstractmethod
from typing import List, Tuple, TYPE_CHECKING

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer

if TYPE_CHECKING:
    from backend.core.preprocessing.column_detector import ColumnInfo


class BaseColumnDetector(ABC):
    """
    Abstract base for column type detection strategies.

    Detects column types and identifies target variable candidates.
    """

    @abstractmethod
    def detect_all(self, df: pd.DataFrame) -> List["ColumnInfo"]:
        """Detect types for all columns. Returns list of ColumnInfo."""
        pass

    @abstractmethod
    def detect_column(self, df: pd.DataFrame, column: str) -> "ColumnInfo":
        """Detect type for single column. Returns ColumnInfo."""
        pass

    @abstractmethod
    def get_numeric_columns(self, df: pd.DataFrame) -> List[str]:
        """Get numeric column names."""
        pass

    @abstractmethod
    def get_categorical_columns(self, df: pd.DataFrame) -> List[str]:
        """Get categorical column names."""
        pass


class BasePreprocessor(ABC):
    """
    Abstract base for preprocessing pipeline strategies.

    Builds sklearn pipelines for transforming raw data into ML-ready features.
    """

    @abstractmethod
    def fit_transform(
        self,
        df: pd.DataFrame,
        target_column: str,
    ) -> Tuple[np.ndarray, pd.Series, List[str]]:
        """
        Fit pipeline and transform data.

        Returns: (X_transformed, y, feature_names)
        Raises: ValueError if target_column not in DataFrame
        """
        pass

    @abstractmethod
    def transform(
        self, df: pd.DataFrame, target_column: str
    ) -> Tuple[np.ndarray, pd.Series]:
        """
        Transform new data using fitted pipeline.

        Returns: (X_transformed, y)
        Raises: ValueError if pipeline not fitted or target_column missing
        """
        pass

    @abstractmethod
    def get_pipeline(self) -> ColumnTransformer:
        """
        Get fitted sklearn ColumnTransformer.

        Raises: ValueError if pipeline not fitted
        """
        pass

    @abstractmethod
    def get_feature_names(self) -> List[str]:
        """
        Get transformed feature names (includes one-hot encoded).

        Raises: ValueError if pipeline not fitted
        """
        pass
