"""
Celery Application Configuration for Spikes.

Purpose:
    Provides a minimal Celery app instance for spike testing.
    Validates Celery + Redis integration works correctly.

Layer: Integration Testing

Usage:
    Terminal 1 - Start worker:
        celery -A backend.spikes.celery_app worker --loglevel=info

    Terminal 2 - Run tests:
        python -m backend.spikes.spike_celery_integration

Dependencies:
    - backend.configuration.settings (CelerySettings)
    - Celery
    - Redis (must be running on localhost:6379)
"""
from celery import Celery

from backend.configuration.settings import get_settings


def create_celery_app() -> Celery:
    """
    Create and configure Celery application for spike testing.

    Returns:
        Configured Celery instance with Redis broker.

    Raises:
        ValueError: If settings validation fails.
    """
    settings = get_settings()

    app = Celery(
        "pipeweave_spikes",
        broker=settings.celery.broker_url,
        backend=settings.celery.result_backend,
    )

    # Celery configuration
    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        result_extended=True,
        task_send_sent_event=True,
        worker_send_task_events=True,
    )

    return app


# Global Celery app instance
celery_app = create_celery_app()
