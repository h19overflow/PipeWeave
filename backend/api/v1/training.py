"""
Model Training API endpoints.

Handles training job submission, status monitoring, cancellation,
and model retrieval. SSE streaming in training_stream.py.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas, backend.services
"""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import (
    get_current_user_id,
    get_training_service,
)
from backend.api.schemas import (
    TrainingJobMetricsResponse,
    TrainingJobRequest,
    TrainingJobStatusResponse,
    TrainingStatus,
    VersionedResponse,
)
from backend.api.v1.training_stream import create_training_stream
from backend.services.training_service import TrainingService


logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/training", tags=["Training"])


@router.post(
    "/jobs",
    response_model=VersionedResponse[TrainingJobStatusResponse],
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_training_job(
    request: TrainingJobRequest,
    service: TrainingService = Depends(get_training_service),
    user_id: UUID = Depends(get_current_user_id),
) -> VersionedResponse[TrainingJobStatusResponse]:
    """Create new training job (async execution)."""
    try:
        result = await service.create_training_job(
            pipeline_id=request.pipeline_id,
            user_id=user_id,
            model_type=request.model_type,
            hyperparameters=request.hyperparameters.dict(),
            validation_split=request.validation_split,
            experiment_name=request.experiment_name,
        )

        logger.info("Training job created", job_id=str(result.job_id))

        return VersionedResponse(
            data=TrainingJobStatusResponse(
                job_id=str(result.job_id),
                pipeline_id=request.pipeline_id,
                status=TrainingStatus.QUEUED,
                progress_percentage=0.0,
                started_at=None,
                completed_at=None,
                error_message=None,
            )
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/jobs/{job_id}/status",
    response_model=VersionedResponse[TrainingJobStatusResponse],
)
async def get_training_status(
    job_id: str,
    service: TrainingService = Depends(get_training_service),
) -> VersionedResponse[TrainingJobStatusResponse]:
    """Poll training job status and progress."""
    try:
        status_info = await service.get_training_status(UUID(job_id))
        return VersionedResponse(
            data=TrainingJobStatusResponse(
                job_id=job_id,
                pipeline_id=str(status_info.pipeline_id),
                status=TrainingStatus(status_info.status),
                progress_percentage=status_info.progress_pct,
                started_at=status_info.started_at,
                completed_at=status_info.completed_at,
                error_message=status_info.error,
            )
        )
    except (ValueError, AttributeError):
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")


@router.get("/jobs/{job_id}/stream")
async def stream_training_progress(
    job_id: str,
    service: TrainingService = Depends(get_training_service),
):
    """Stream real-time training progress via SSE."""
    return await create_training_stream(job_id, service)


@router.get(
    "/jobs/{job_id}/metrics",
    response_model=VersionedResponse[TrainingJobMetricsResponse],
)
async def get_training_metrics(
    job_id: str,
    service: TrainingService = Depends(get_training_service),
) -> VersionedResponse[TrainingJobMetricsResponse]:
    """Get final metrics for completed job."""
    try:
        job = await service.get_training_job(UUID(job_id))
        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.status != "completed":
            raise HTTPException(
                status_code=409,
                detail=f"Job status is '{job.status}', expected 'completed'",
            )

        return VersionedResponse(
            data=TrainingJobMetricsResponse(
                job_id=job_id,
                metrics=job.metrics or {},
                model_artifact_url=None,
                generated_at=job.completed_at,
            )
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Invalid job ID")


@router.post("/jobs/{job_id}/cancel")
async def cancel_training_job(
    job_id: str,
    service: TrainingService = Depends(get_training_service),
) -> VersionedResponse[dict]:
    """Cancel running training job."""
    try:
        cancelled = await service.cancel_training_job(UUID(job_id))
        if not cancelled:
            raise HTTPException(status_code=400, detail="Not cancellable")

        logger.info("Training job cancelled", job_id=job_id)
        return VersionedResponse(data={"cancelled": True, "job_id": job_id})
    except ValueError:
        raise HTTPException(status_code=404, detail="Job not found")
