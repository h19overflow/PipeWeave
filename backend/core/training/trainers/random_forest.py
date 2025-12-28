"""
Random Forest Trainer.

Trains Random Forest models (classification/regression) with progress reporting.
Pure logic - no I/O operations.
"""

import time
from typing import Callable, Optional

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split

from backend.core.training.base import BaseTrainer
from backend.core.training.models import (
    TrainingConfig,
    TrainingResult,
    FeatureImportance,
)
from backend.core.training.metrics_calculator import MetricsCalculator
from backend.core.preprocessing.fixed_pipeline import FixedPreprocessor


class RandomForestTrainer(BaseTrainer):
    """
    Random Forest trainer for classification/regression.

    Flow: preprocess(10%) → split(20%) → init(30%) → train(40-70%) →
    predict(70-80%) → metrics(80-90%) → importance(90-100%).
    """

    def __init__(self) -> None:
        self._preprocessor = FixedPreprocessor()
        self._metrics = MetricsCalculator()

    def train(
        self,
        df: pd.DataFrame,
        config: TrainingConfig,
        progress_callback: Optional[Callable[[int, str], None]] = None,
    ) -> TrainingResult:
        """Train Random Forest. Returns TrainingResult with model and metrics."""
        if config.task_type not in ["classification", "regression"]:
            raise ValueError(
                f"Invalid task_type: {config.task_type}. "
                "Must be 'classification' or 'regression'"
            )

        total_start = time.time()
        report = progress_callback if progress_callback else lambda p, s: None

        # Step 1: Preprocessing
        report(10, "Preprocessing data...")
        preprocess_start = time.time()
        X, y, feature_names = self._preprocessor.fit_transform(df, config.target_column)
        preprocess_time = time.time() - preprocess_start

        # Step 2: Train/test split
        report(20, "Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=config.test_size,
            random_state=config.random_state,
            stratify=y if config.task_type == "classification" else None,
        )

        # Step 3: Create model
        report(30, "Initializing model...")

        if config.task_type == "classification":
            model = RandomForestClassifier(
                n_estimators=config.n_estimators,
                max_depth=config.max_depth,
                min_samples_split=config.min_samples_split,
                min_samples_leaf=config.min_samples_leaf,
                random_state=config.random_state,
                n_jobs=-1,
            )
        else:
            model = RandomForestRegressor(
                n_estimators=config.n_estimators,
                max_depth=config.max_depth,
                min_samples_split=config.min_samples_split,
                min_samples_leaf=config.min_samples_leaf,
                random_state=config.random_state,
                n_jobs=-1,
            )

        # Step 4: Train
        report(40, "Training model...")
        train_start = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - train_start

        # Step 5: Predict and calculate metrics
        report(70, "Generating predictions...")
        y_pred = model.predict(X_test)
        report(80, "Calculating metrics...")

        if config.task_type == "classification":
            class_labels = [str(c) for c in model.classes_]
            classification_metrics = self._metrics.calculate_classification(
                y_test, y_pred, class_labels
            )
            regression_metrics = None
        else:
            classification_metrics = None
            regression_metrics = self._metrics.calculate_regression(y_test, y_pred)

        # Step 6: Feature importance
        report(90, "Analyzing feature importance...")
        importances = self._extract_feature_importance(
            model.feature_importances_,
            feature_names,
        )
        total_time = time.time() - total_start
        report(100, "Training complete!")

        return TrainingResult(
            model=model,
            config=config,
            classification_metrics=classification_metrics,
            regression_metrics=regression_metrics,
            feature_importances=importances,
            feature_names=feature_names,
            preprocessing_time_seconds=preprocess_time,
            training_time_seconds=train_time,
            total_time_seconds=total_time,
            train_samples=len(X_train),
            test_samples=len(X_test),
        )

    def _extract_feature_importance(
        self,
        importances: np.ndarray,
        feature_names: list[str],
    ) -> list[FeatureImportance]:
        """Extract and rank feature importances."""
        indexed = list(zip(feature_names, importances))
        indexed.sort(key=lambda x: x[1], reverse=True)

        return [
            FeatureImportance(feature_name=name, importance=float(imp), rank=i + 1)
            for i, (name, imp) in enumerate(indexed)
        ]
