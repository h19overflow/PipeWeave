"""
Celery Integration Spike - Validates Celery + Redis works correctly.

Purpose:
    Throwaway validation script to prove async job queue functionality.
    Tests task submission, progress monitoring, error handling, and heartbeats.

Layer: Integration Testing

Prerequisite:
    Start Celery worker in separate terminal:
        celery -A backend.spikes.celery_app worker --loglevel=info

Usage:
    python -m backend.spikes.spike_celery_integration

Expected Output:
    [CELERY SPIKE] Starting Celery + Redis integration test...
    [✓] Celery app configured with Redis broker
    [✓] Simple task submitted (task_id: abc-123)
    [✓] Task completed with result: "Hello from Celery!"
    [✓] Long-running task progress: 25% → 50% → 75% → 100%
    [✓] Progress monitoring works correctly
    [✓] Task failure handled gracefully
    [✓] Heartbeat monitoring detected active task
    [CELERY SPIKE] All tests passed!

Dependencies:
    - backend.spikes.celery_app
    - backend.spikes.spike_celery_tasks
    - backend.spikes.spike_celery_test_functions
"""
import sys

from backend.spikes.celery_app import celery_app
from backend.spikes.spike_celery_test_functions import (
    test_failing_task,
    test_heartbeat_monitoring,
    test_long_running_task,
    test_simple_task,
    test_task_metadata_retrieval,
)


def main() -> None:
    """Run all Celery integration spike tests."""
    print("=" * 70)
    print("[CELERY SPIKE] Starting Celery + Redis integration test...")
    print("=" * 70)

    # Verify Celery app configuration
    print(f"\n[CONFIG] Broker: {celery_app.conf.broker_url}")
    print(f"[CONFIG] Backend: {celery_app.conf.result_backend}")
    print("[✓] Celery app configured with Redis broker")

    try:
        test_simple_task()
        test_long_running_task()
        test_failing_task()
        test_heartbeat_monitoring()
        test_task_metadata_retrieval()

        print("\n" + "=" * 70)
        print("[CELERY SPIKE] All tests passed! ✓")
        print("=" * 70)

    except Exception as e:
        print("\n" + "=" * 70)
        print(f"[CELERY SPIKE] Tests failed: {e}")
        print("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
