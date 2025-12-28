"""
EDA service - Orchestrates EDA workflow.

Purpose: Queue and track EDA generation jobs
Layer: Services (Orchestration)
Dependencies: boundary.crud, workers.eda_worker
"""

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.eda_report import CRUDEDAReport
from backend.boundary.crud.dataset import CRUDDataset
from backend.boundary.storage import S3Storage
from backend.configuration.settings import get_settings
from backend.workers.eda_worker import generate_eda_report


@dataclass
class EDAJobResult:
    """Result of queuing EDA generation."""

    report_id: UUID
    job_id: str
    status: str


@dataclass
class EDAReportInfo:
    """EDA report information."""

    id: UUID
    dataset_id: UUID
    status: str
    summary: Optional[Dict[str, Any]]
    generation_time_seconds: Optional[float]
    created_at: datetime


class EDAService:
    """
    Orchestrates EDA report generation workflow.

    Responsibilities:
    - Queue EDA generation jobs
    - Track job progress
    - Retrieve completed reports
    """

    def __init__(
        self,
        db: AsyncSession,
        eda_crud: CRUDEDAReport,
        dataset_crud: CRUDDataset,
        s3_storage: S3Storage,
    ) -> None:
        """
        Initialize service with dependencies.

        Args:
            db: Database session
            eda_crud: EDA report CRUD operations
            dataset_crud: Dataset CRUD operations
            s3_storage: S3 storage client
        """
        self._db = db
        self._eda_crud = eda_crud
        self._dataset_crud = dataset_crud
        self._s3 = s3_storage
        self._settings = get_settings()

    async def queue_eda_generation(
        self,
        dataset_id: UUID,
        user_id: UUID,
    ) -> EDAJobResult:
        """
        Queue EDA report generation.

        Args:
            dataset_id: Dataset to analyze
            user_id: Owner of dataset

        Returns:
            EDAJobResult with report_id and job_id

        Raises:
            ValueError: If dataset not found or not validated
        """
        dataset = await self._dataset_crud.get(self._db, dataset_id)
        if dataset is None:
            raise ValueError(f"Dataset {dataset_id} not found")

        if dataset.status != "validated":
            raise ValueError("Dataset must be validated before EDA")

        report_id = uuid4()
        await self._eda_crud.create(
            self._db,
            {
                "id": report_id,
                "dataset_id": dataset_id,
                "user_id": user_id,
                "status": "queued",
            },
        )

        task = generate_eda_report.delay(
            dataset_id=str(dataset_id),
            user_id=str(user_id),
            s3_key=dataset.s3_key_raw,
            report_id=str(report_id),
        )

        return EDAJobResult(
            report_id=report_id,
            job_id=task.id,
            status="queued",
        )

    async def get_eda_status(
        self,
        report_id: UUID,
    ) -> Dict[str, Any]:
        """
        Get EDA job status and progress.

        Args:
            report_id: Report UUID

        Returns:
            Status dict with progress information

        Raises:
            ValueError: If report not found
        """
        report = await self._eda_crud.get(self._db, report_id)
        if report is None:
            raise ValueError(f"Report {report_id} not found")

        if report.status in ("queued", "running"):
            from celery.result import AsyncResult
            from backend.workers.celery_app import celery_app

            task = AsyncResult(report.celery_task_id, app=celery_app)
            if task.state == "PROGRESS":
                meta = task.info or {}
                return {
                    "status": "running",
                    "progress_pct": meta.get("progress_pct", 0),
                    "step": meta.get("step", "Processing..."),
                }
            elif task.state == "SUCCESS":
                return {"status": "completed", "progress_pct": 100}
            elif task.state == "FAILURE":
                return {"status": "failed", "error": str(task.result)}

        return {
            "status": report.status,
            "progress_pct": 100 if report.status == "completed" else 0,
        }

    async def get_full_report(
        self,
        report_id: UUID,
    ) -> Optional[Dict[str, Any]]:
        """
        Get full EDA report (from PostgreSQL or S3).

        Args:
            report_id: Report UUID

        Returns:
            Full report JSON or None if not found
        """
        report = await self._eda_crud.get(self._db, report_id)
        if report is None:
            return None

        if report.storage_location == "postgres":
            return report.full_report
        else:
            content = self._s3.download_file_content(report.s3_key)
            return json.loads(content)
