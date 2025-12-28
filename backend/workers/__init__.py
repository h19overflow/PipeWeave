"""
Celery Workers Module - Async task execution for background jobs.

Exports:
    celery_app: Celery application instance
    generate_eda_report: EDA generation task
    train_model: Model training task
"""

from backend.workers.config import celery_app
from backend.workers.tasks import generate_eda_report, train_model

__all__ = [
    "celery_app",
    "generate_eda_report",
    "train_model",
]
