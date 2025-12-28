"""
Training Celery Worker.

Location: backend/workers/training_worker.py
Layer: Worker (Async Task Execution)

Purpose:
    Async model training task with progress updates and S3 artifact storage.

Usage:
    celery -A backend.workers.celery_app worker --loglevel=info -Q training
"""
import pickle
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Any

import pandas as pd
from celery import Task

from backend.configuration.logging import get_logger, set_correlation_id
from backend.configuration.settings import get_settings
from backend.core.training.models import TrainingConfig
from backend.core.training.trainers.random_forest import RandomForestTrainer
from backend.boundary.storage import S3Storage
from backend.workers.celery_app import celery_app

logger = get_logger(__name__)


class TrainingTask(Task):
    """Base task with shared resources."""

    _s3: S3Storage | None = None
    _trainer: RandomForestTrainer | None = None

    @property
    def s3(self) -> S3Storage:
        if self._s3 is None:
            self._s3 = S3Storage()
        return self._s3

    @property
    def trainer(self) -> RandomForestTrainer:
        if self._trainer is None:
            self._trainer = RandomForestTrainer()
        return self._trainer


@celery_app.task(
    bind=True,
    base=TrainingTask,
    name="training.train_model",
    queue="training",
    max_retries=2,
    default_retry_delay=120,
    time_limit=600,
)
def train_model(
    self,
    job_id: str,
    dataset_id: str,
    user_id: str,
    s3_key: str,
    target_column: str,
    task_type: str,
    hyperparameters: dict[str, Any],
) -> dict[str, Any]:
    """
    Train ML model asynchronously.

    Args:
        job_id: Training job UUID
        dataset_id: Dataset UUID
        user_id: Owner UUID
        s3_key: S3 key of CSV file
        target_column: Target column name
        task_type: "classification" or "regression"
        hyperparameters: Model hyperparameters

    Returns:
        Dict with training results and model location

    Raises:
        Exception: Training failures
    """
    set_correlation_id(f"train-{job_id}")
    logger.info(
        "Starting model training",
        job_id=job_id,
        dataset_id=dataset_id,
        task_type=task_type,
    )

    def progress_callback(pct: int, step: str) -> None:
        """Report progress to Celery."""
        self.update_state(state="PROGRESS", meta={"progress_pct": pct, "step": step})

    try:
        progress_callback(5, "Downloading dataset...")

        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        self.s3.download_file(s3_key, tmp_path)
        df = pd.read_csv(tmp_path)
        tmp_path.unlink()

        config = TrainingConfig(
            target_column=target_column,
            task_type=task_type,
            n_estimators=hyperparameters.get("n_estimators", 100),
            max_depth=hyperparameters.get("max_depth"),
            test_size=hyperparameters.get("test_size", 0.2),
        )

        result = self.trainer.train(df, config, progress_callback)

        progress_callback(95, "Saving model...")

        model_bytes = pickle.dumps(result.model)
        model_s3_key = f"models/{user_id}/{job_id}/model.pkl"

        self.s3.upload_file(
            file_obj=BytesIO(model_bytes),
            s3_key=model_s3_key,
            content_type="application/octet-stream",
        )

        progress_callback(100, "Complete!")

        metrics_dict = _build_metrics_dict(result)
        feature_importances = _build_feature_importances(result)

        logger.info(
            "Training complete",
            job_id=job_id,
            training_time=result.total_time_seconds,
            metrics=metrics_dict,
        )

        return {
            "job_id": job_id,
            "status": "completed",
            "model_s3_key": model_s3_key,
            "metrics": metrics_dict,
            "feature_importances": feature_importances,
            "training_time_seconds": result.total_time_seconds,
            "train_samples": result.train_samples,
            "test_samples": result.test_samples,
        }

    except Exception as e:
        logger.error("Training failed", error=str(e), job_id=job_id)
        self.update_state(state="FAILURE", meta={"error": str(e), "step": "Training failed"})
        raise


def _build_metrics_dict(result) -> dict[str, Any]:
    """Build metrics dictionary from training result."""
    if result.classification_metrics:
        return {
            "accuracy": result.classification_metrics.accuracy,
            "precision": result.classification_metrics.precision,
            "recall": result.classification_metrics.recall,
            "f1_score": result.classification_metrics.f1_score,
            "confusion_matrix": result.classification_metrics.confusion_matrix,
        }
    elif result.regression_metrics:
        return {
            "mae": result.regression_metrics.mae,
            "rmse": result.regression_metrics.rmse,
            "r2_score": result.regression_metrics.r2_score,
        }
    return {}


def _build_feature_importances(result) -> list[dict[str, Any]]:
    """Build feature importances list (top 20)."""
    return [
        {"feature": fi.feature_name, "importance": fi.importance, "rank": fi.rank}
        for fi in result.feature_importances[:20]
    ]
