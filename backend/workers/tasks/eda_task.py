"""
EDA generation Celery worker.

Purpose: Async EDA report generation task
Layer: Workers (Async Task Queue)
Dependencies: celery, pandas, backend.core.eda, backend.boundary
"""

import io
import json
import tempfile
from pathlib import Path
from typing import Any, Dict

import pandas as pd
from celery import Task

import boto3

from backend.workers.celery_app import celery_app
from backend.configuration.settings import get_settings
from backend.configuration.logging import get_logger, set_correlation_id
from backend.core.eda.profilers.ydata import YDataProfiler


logger = get_logger(__name__)


class EDATask(Task):
    """Base task with shared resources."""

    _s3_client = None
    _profiler: YDataProfiler | None = None

    @property
    def s3_client(self):
        """Lazy-load boto3 S3 client."""
        if self._s3_client is None:
            settings = get_settings()
            self._s3_client = boto3.client(
                "s3",
                region_name=settings.s3.region,
                endpoint_url=settings.s3.endpoint_url,
            )
        return self._s3_client

    @property
    def profiler(self) -> YDataProfiler:
        """Lazy-load profiler."""
        if self._profiler is None:
            self._profiler = YDataProfiler(minimal=True)
        return self._profiler


@celery_app.task(
    bind=True,
    base=EDATask,
    name="eda.generate_report",
    queue="eda",
    max_retries=3,
    default_retry_delay=60,
)
def generate_eda_report(
    self,
    dataset_id: str,
    user_id: str,
    s3_key: str,
    report_id: str,
) -> Dict[str, Any]:
    """
    Generate EDA report for dataset.

    Args:
        dataset_id: Dataset UUID
        user_id: Owner UUID
        s3_key: S3 key of CSV file
        report_id: EDA report UUID (pre-created)

    Returns:
        Dict with report metadata
    """
    set_correlation_id(f"eda-{report_id}")
    logger.info("Starting EDA", dataset_id=dataset_id, report_id=report_id)

    settings = get_settings()

    try:
        self.update_state(
            state="PROGRESS",
            meta={"progress_pct": 10, "step": "Downloading dataset..."},
        )

        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        self.s3_client.download_file(settings.s3.bucket, s3_key, str(tmp_path))

        self.update_state(
            state="PROGRESS",
            meta={"progress_pct": 20, "step": "Loading dataset..."},
        )

        df = pd.read_csv(tmp_path)

        self.update_state(
            state="PROGRESS",
            meta={"progress_pct": 30, "step": "Generating EDA..."},
        )

        result = self.profiler.generate_report(df, title=f"EDA: {dataset_id}")

        self.update_state(
            state="PROGRESS",
            meta={"progress_pct": 80, "step": "Saving report..."},
        )

        report_json = json.dumps(result.full_report_json)
        report_size = len(report_json.encode())

        storage_location = "postgres"
        s3_report_key = None

        if report_size > settings.storage.eda_report_threshold_bytes:
            storage_location = "s3"
            s3_report_key = f"eda_reports/{user_id}/{report_id}/report.json"
            file_obj = io.BytesIO(report_json.encode())
            self.s3_client.upload_fileobj(
                file_obj,
                settings.s3.bucket,
                s3_report_key,
                ExtraArgs={"ContentType": "application/json"},
            )

        tmp_path.unlink()

        self.update_state(
            state="PROGRESS",
            meta={"progress_pct": 100, "step": "Complete"},
        )

        logger.info(
            "EDA complete",
            report_id=report_id,
            generation_time=result.generation_time_seconds,
            report_size=report_size,
            storage=storage_location,
        )

        return {
            "report_id": report_id,
            "status": "completed",
            "summary": result.summary.to_dict(),
            "generation_time_seconds": result.generation_time_seconds,
            "report_size_bytes": report_size,
            "storage_location": storage_location,
            "s3_key": s3_report_key,
            "full_report": result.full_report_json if storage_location == "postgres" else None,
        }

    except Exception as e:
        logger.error("EDA failed", error=str(e), report_id=report_id)
        raise self.retry(exc=e)
