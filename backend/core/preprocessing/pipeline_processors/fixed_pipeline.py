"""
Fixed Preprocessing Pipeline.

MVP preprocessing: numeric (median impute + scale), categorical (mode impute + one-hot).
Pure logic - no I/O operations.
"""

from typing import Tuple, override

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

from backend.core.preprocessing.base import BasePreprocessor
from backend.core.preprocessing.column_detector import ColumnDetector


class FixedPreprocessor(BasePreprocessor):
    """
    Fixed preprocessing pipeline for MVP.

    Strategy: numeric (median + scale), categorical (mode + one-hot, max 10 unique).
    Drops high-cardinality columns.
    """

    def __init__(self, max_categories: int = 10) -> None:
        self._max_categories = max_categories
        self._detector = ColumnDetector()
        self._pipeline: ColumnTransformer | None = None
        self._feature_names: list[str] = []

    @override
    def fit_transform(
        self,
        df: pd.DataFrame,
        target_column: str,
    ) -> Tuple[np.ndarray, pd.Series, list[str]]:
        """Fit pipeline and transform data. Returns (X, y, feature_names)."""
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in DataFrame")

        # Separate features and target
        X = df.drop(columns=[target_column])
        y = df[target_column]

        # Detect column types
        numeric_cols = self._detector.get_numeric_columns(X)
        categorical_cols = self._detector.get_categorical_columns(X)

        # Limit categorical columns by cardinality
        categorical_cols = [
            col
            for col in categorical_cols
            if X[col].nunique() <= self._max_categories
        ]

        # Build transformers
        numeric_transformer = Pipeline(
            [
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )

        categorical_transformer = Pipeline(
            [
                ("imputer", SimpleImputer(strategy="most_frequent")),
                (
                    "encoder",
                    OneHotEncoder(
                        handle_unknown="ignore",
                        sparse_output=False,
                        max_categories=self._max_categories,
                    ),
                ),
            ]
        )

        # Build ColumnTransformer
        self._pipeline = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, numeric_cols),
                ("cat", categorical_transformer, categorical_cols),
            ],
            remainder="drop",  # Drop columns not in either list
        )

        # Fit and transform
        X_transformed = self._pipeline.fit_transform(X)

        # Get feature names
        self._feature_names = self._get_feature_names(
            numeric_cols, categorical_cols, X
        )

        return X_transformed, y, self._feature_names

    @override
    def transform(
        self, df: pd.DataFrame, target_column: str
    ) -> Tuple[np.ndarray, pd.Series]:
        """Transform new data using fitted pipeline. Returns (X, y)."""
        if self._pipeline is None:
            raise ValueError("Pipeline not fitted. Call fit_transform first.")

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in DataFrame")

        X = df.drop(columns=[target_column])
        y = df[target_column]
        X_transformed = self._pipeline.transform(X)

        return X_transformed, y

    @override
    def get_pipeline(self) -> ColumnTransformer:
        """Get the fitted sklearn ColumnTransformer."""
        if self._pipeline is None:
            raise ValueError("Pipeline not fitted.")
        return self._pipeline

    @override
    def get_feature_names(self) -> list[str]:
        """Get transformed feature names."""
        return self._feature_names

    def _get_feature_names(
        self,
        numeric_cols: list[str],
        categorical_cols: list[str],
        X: pd.DataFrame,
    ) -> list[str]:
        """Extract feature names from fitted pipeline."""
        feature_names = list(numeric_cols)

        # Get one-hot encoded feature names
        if categorical_cols and self._pipeline is not None:
            encoder = self._pipeline.named_transformers_["cat"].named_steps["encoder"]
            for i, col in enumerate(categorical_cols):
                categories = encoder.categories_[i]
                for cat in categories:
                    feature_names.append(f"{col}_{cat}")

        return feature_names
