"""Training Service: Training job orchestration."""
from typing import Any, Dict, Optional
from uuid import UUID, uuid4

from celery.result import AsyncResult
from sqlalchemy.ext.asyncio import AsyncSession

from backend.boundary.crud.dataset import dataset_crud
from backend.boundary.crud.pipeline import pipeline_crud
from backend.boundary.crud.training_job import training_job_crud
from backend.boundary.models.training_job import TrainingJob
from backend.boundary.storage import S3Storage
from backend.configuration.logging import get_logger
from backend.workers.celery_app import celery_app

logger = get_logger(__name__)


class TrainingService:
    """Orchestrate training job workflows."""

    def __init__(self, db: AsyncSession, s3_storage: S3Storage):
        self._db = db
        self._s3 = s3_storage
        self._crud = training_job_crud

    async def create_training_job(
        self,
        pipeline_id: UUID,
        user_id: UUID,
        dataset_id: UUID,
        target_column: str,
        task_type: str = "classification",
        hyperparameters: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Create training job and submit to Celery."""
        if task_type not in ("classification", "regression"):
            raise ValueError(f"Invalid task_type: {task_type}")

        pipeline = await pipeline_crud.get(self._db, pipeline_id)
        if pipeline is None:
            raise ValueError(f"Pipeline {pipeline_id} not found")

        dataset = await dataset_crud.get(self._db, dataset_id)
        if dataset is None:
            raise ValueError(f"Dataset {dataset_id} not found")
        if dataset.status != "validated":
            raise ValueError("Dataset must be validated before training")

        job_id = uuid4()
        await self._crud.create(
            self._db,
            {
                "id": job_id,
                "pipeline_id": pipeline_id,
                "user_id": user_id,
                "dataset_id": dataset_id,
                "pipeline_snapshot": pipeline.config,
                "status": "queued",
                "progress_percentage": 0,
            },
        )

        from backend.workers.training_worker import train_model

        task = train_model.delay(
            job_id=str(job_id),
            dataset_id=str(dataset_id),
            user_id=str(user_id),
            s3_key=dataset.s3_key_raw,
            target_column=target_column,
            task_type=task_type,
            hyperparameters=hyperparameters or {},
        )

        await self._crud.update(
            self._db, id=job_id, obj_in={"celery_task_id": str(task.id)}
        )

        logger.info(
            "Training job created",
            job_id=str(job_id),
            celery_task_id=str(task.id),
        )
        return str(job_id)

    async def get_training_status(self, job_id: str) -> Dict[str, Any]:
        """Poll Celery task state and merge with DB data."""
        job = await self._crud.get(self._db, UUID(job_id))
        if job is None:
            return {"status": "not_found", "job_id": job_id}

        if job.status in ("queued", "running"):
            result = AsyncResult(job.celery_task_id, app=celery_app)

            if result.state == "PROGRESS":
                meta = result.info or {}
                return {
                    "status": "running",
                    "job_id": job_id,
                    "progress_pct": meta.get("progress_pct", 0),
                    "current_step": meta.get("step", "Processing..."),
                }
            elif result.state == "SUCCESS":
                return {"status": "completed", "job_id": job_id, "progress_pct": 100}
            elif result.state == "FAILURE":
                error = str(result.result) if result.result else "Unknown error"
                return {"status": "failed", "job_id": job_id, "error": error}

        return {
            "status": job.status,
            "job_id": job_id,
            "progress_pct": job.progress_percentage or 0,
        }

    async def get_training_job(self, job_id: str) -> Optional[TrainingJob]:
        """Fetch full TrainingJob record."""
        return await self._crud.get(self._db, UUID(job_id))

    async def cancel_training_job(self, job_id: str) -> bool:
        """Revoke Celery task and update DB status."""
        job = await self._crud.get(self._db, UUID(job_id))
        if job is None:
            raise ValueError(f"Job {job_id} not found")

        if job.status in ("completed", "failed", "cancelled"):
            logger.warning("Cannot cancel terminal job", job_id=job_id)
            return False

        celery_app.control.revoke(job.celery_task_id, terminate=True)
        await self._crud.update(
            self._db, id=UUID(job_id), obj_in={"status": "cancelled"}
        )

        logger.info("Training job cancelled", job_id=job_id)
        return True
