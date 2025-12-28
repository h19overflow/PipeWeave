"""
Celery application configuration.

Purpose: Configure Celery for distributed task processing
Layer: Workers (Async Task Queue)
Dependencies: celery, backend.configuration.settings
"""

from celery import Celery

from backend.configuration.settings import get_settings


def create_celery_app() -> Celery:
    """
    Create and configure Celery application.

    Returns:
        Configured Celery instance

    Example:
        >>> from backend.workers.celery_app import celery_app
        >>> result = some_task.delay(arg1, arg2)
    """
    settings = get_settings()

    app = Celery(
        "pipeweave",
        broker=settings.celery.broker_url,
        backend=settings.celery.result_backend,
        include=[
            "backend.workers.eda_worker",
            "backend.workers.training_worker",
        ],
    )

    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        result_extended=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        broker_heartbeat=10,
        worker_send_task_events=True,
        task_send_sent_event=True,
    )

    return app


celery_app = create_celery_app()
