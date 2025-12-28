"""Async task implementations."""

from .eda_task import generate_eda_report
from .training_task import train_model

__all__ = ["generate_eda_report", "train_model"]
