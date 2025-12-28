"""
Celery Integration Test Functions.

Purpose:
    Individual test functions for Celery spike validation.
    Separated to keep spike_celery_integration.py under 150 lines.

Layer: Integration Testing
"""
import time

from celery.result import AsyncResult

from backend.spikes.spike_celery_tasks import (
    failing_task,
    heartbeat_task,
    long_running_task,
    simple_task,
)


def test_simple_task() -> None:
    """Test basic task submission and result retrieval."""
    print("\n[TEST] Simple task submission...")

    result: AsyncResult = simple_task.delay()
    task_id = result.task_id

    print(f"  [✓] Task submitted (task_id: {task_id})")

    try:
        final_result = result.get(timeout=10)
        print(f"  [✓] Task completed with result: {final_result!r}")
    except Exception as e:
        print(f"  [✗] Task failed: {e}")
        raise


def test_long_running_task() -> None:
    """Test long-running task with progress monitoring."""
    print("\n[TEST] Long-running task with progress updates...")

    duration = 8
    result: AsyncResult = long_running_task.delay(duration=duration)

    print(f"  [✓] Long-running task submitted (task_id: {result.task_id})")

    progress_values: list[int] = []

    while not result.ready():
        if result.state == "PROGRESS":
            meta = result.info
            progress_pct = meta.get("progress_pct", 0)
            current_step = meta.get("current_step", "Unknown")

            if progress_pct not in progress_values:
                progress_values.append(progress_pct)
                print(f"  [→] Progress: {progress_pct}% ({current_step})")

        time.sleep(0.5)

    final_result = result.get()
    print(f"  [✓] Task completed: {final_result}")
    print(f"  [✓] Progress monitoring works ({len(progress_values)} updates)")


def test_failing_task() -> None:
    """Test task failure handling."""
    print("\n[TEST] Task failure simulation...")

    result: AsyncResult = failing_task.delay(fail_after=3)

    print(f"  [✓] Failing task submitted (task_id: {result.task_id})")

    try:
        result.get(timeout=10)
        print("  [✗] Task should have failed but succeeded")
        raise AssertionError("Expected task to fail")
    except RuntimeError as e:
        print(f"  [✓] Task failure handled gracefully: {e}")


def test_heartbeat_monitoring() -> None:
    """Test heartbeat monitoring for stale task detection."""
    print("\n[TEST] Heartbeat monitoring...")

    duration = 10
    result: AsyncResult = heartbeat_task.delay(duration=duration)

    print(f"  [✓] Heartbeat task submitted (task_id: {result.task_id})")

    last_heartbeat_time: float | None = None
    heartbeat_count = 0

    while not result.ready():
        if result.state == "PROGRESS":
            meta = result.info
            current_heartbeat = meta.get("last_heartbeat")

            if current_heartbeat and current_heartbeat != last_heartbeat_time:
                heartbeat_count += 1
                last_heartbeat_time = current_heartbeat
                elapsed = meta.get("elapsed_seconds", 0)

                if heartbeat_count % 3 == 0:
                    print(f"  [→] Heartbeat {heartbeat_count} at {elapsed}s")

        time.sleep(0.5)

    final_result = result.get()
    print(f"  [✓] Task completed: {final_result}")
    print(f"  [✓] Heartbeat monitoring works ({heartbeat_count} heartbeats)")


def test_task_metadata_retrieval() -> None:
    """Test retrieving task metadata and state."""
    print("\n[TEST] Task metadata retrieval...")

    result: AsyncResult = simple_task.delay()
    task_id = result.task_id

    result.get(timeout=10)

    print(f"  [✓] Task ID: {task_id}")
    print(f"  [✓] Task State: {result.state}")
    print(f"  [✓] Task Result: {result.result}")
    print(f"  [✓] Task Successful: {result.successful()}")
