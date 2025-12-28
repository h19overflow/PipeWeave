"""
Test Celery Tasks for Integration Spike.

Purpose:
    Defines test tasks that validate different Celery features:
    - Simple immediate return
    - Long-running tasks with progress updates
    - Task failure simulation
    - Heartbeat monitoring

Layer: Integration Testing

Usage:
    These tasks are imported and executed by spike_celery_integration.py

Dependencies:
    - backend.spikes.celery_app
    - Celery task decorators
"""
import time
from typing import Any

from celery import Task

from backend.spikes.celery_app import celery_app


@celery_app.task(bind=True, name="spikes.simple_task")
def simple_task(self: Task) -> str:
    """
    Simple task that returns immediately.

    Returns:
        Success message string.
    """
    return "Hello from Celery!"


@celery_app.task(bind=True, name="spikes.long_running_task")
def long_running_task(self: Task, duration: int = 10) -> dict[str, Any]:
    """
    Simulates long-running task with progress updates.

    Updates task state every second with progress percentage.

    Args:
        duration: Total duration in seconds (default: 10).

    Returns:
        Dictionary with completion status and total steps.
    """
    for i in range(duration):
        progress = int((i + 1) / duration * 100)
        self.update_state(
            state="PROGRESS",
            meta={
                "progress_pct": progress,
                "current_step": f"Step {i + 1}/{duration}",
                "last_heartbeat": time.time(),
            },
        )
        time.sleep(1)

    return {"status": "completed", "total_steps": duration}


@celery_app.task(bind=True, name="spikes.failing_task")
def failing_task(self: Task, fail_after: int = 3) -> dict[str, Any]:
    """
    Task that simulates failure after N seconds.

    Args:
        fail_after: Seconds to wait before raising exception.

    Returns:
        Never returns - always raises exception.

    Raises:
        RuntimeError: After specified delay.
    """
    for i in range(fail_after):
        progress = int((i + 1) / fail_after * 100)
        self.update_state(
            state="PROGRESS",
            meta={"progress_pct": progress, "message": "Processing..."},
        )
        time.sleep(1)

    raise RuntimeError("Simulated task failure for testing")


@celery_app.task(bind=True, name="spikes.heartbeat_task")
def heartbeat_task(self: Task, duration: int = 15) -> dict[str, Any]:
    """
    Task that updates heartbeat timestamp every second.

    Used to validate heartbeat monitoring and stale task detection.

    Args:
        duration: Total duration in seconds.

    Returns:
        Dictionary with heartbeat statistics.
    """
    heartbeat_count = 0
    start_time = time.time()

    for i in range(duration):
        heartbeat_count += 1
        current_time = time.time()

        self.update_state(
            state="PROGRESS",
            meta={
                "progress_pct": int((i + 1) / duration * 100),
                "last_heartbeat": current_time,
                "heartbeat_count": heartbeat_count,
                "elapsed_seconds": int(current_time - start_time),
            },
        )
        time.sleep(1)

    return {
        "status": "completed",
        "total_heartbeats": heartbeat_count,
        "duration": int(time.time() - start_time),
    }
