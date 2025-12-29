"""
Training progress SSE streaming helpers.

Provides Server-Sent Events streaming for real-time training progress.

Layer: 2 (API)
Dependencies: fastapi, backend.services
"""

import asyncio
import json
from typing import AsyncGenerator
from uuid import UUID

import structlog
from fastapi.responses import StreamingResponse

from backend.services.training_service import TrainingService


logger = structlog.get_logger(__name__)


async def create_training_stream(
    job_id: str,
    service: TrainingService,
) -> StreamingResponse:
    """
    Create SSE stream for training progress.

    Args:
        job_id: Training job UUID
        service: Training service instance

    Returns:
        StreamingResponse with text/event-stream content
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events for training progress."""
        retry_count = 0
        max_retries = 300  # 5 minutes max

        while retry_count < max_retries:
            try:
                job_uuid = UUID(job_id)
                status_info = await service.get_training_status(job_uuid)

                event_data = {
                    "job_id": job_id,
                    "status": status_info.status,
                    "progress_percentage": status_info.progress_pct,
                    "current_step": status_info.current_step,
                    "error": status_info.error,
                }

                yield f"data: {json.dumps(event_data)}\n\n"

                # Stop streaming on terminal states
                if status_info.status in ("completed", "failed", "cancelled"):
                    logger.info(
                        "SSE stream completed",
                        job_id=job_id,
                        final_status=status_info.status,
                    )
                    break

                await asyncio.sleep(1)
                retry_count += 1

            except (ValueError, AttributeError):
                error_data = {"error": f"Job {job_id} not found"}
                yield f"data: {json.dumps(error_data)}\n\n"
                logger.warning("SSE stream job not found", job_id=job_id)
                break

            except Exception as e:
                logger.error(
                    "SSE stream error",
                    job_id=job_id,
                    error=str(e),
                )
                error_data = {"error": str(e)}
                yield f"data: {json.dumps(error_data)}\n\n"
                await asyncio.sleep(2)
                retry_count += 1

        if retry_count >= max_retries:
            timeout_data = {"error": "Stream timeout after 5 minutes"}
            yield f"data: {json.dumps(timeout_data)}\n\n"
            logger.warning("SSE stream timeout", job_id=job_id)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
