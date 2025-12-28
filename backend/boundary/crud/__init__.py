"""CRUD operations for database models.

This module provides CRUD (Create, Read, Update, Delete) interfaces
for all database models with proper separation of concerns.
"""

from backend.boundary.crud.base import CRUDBase
from backend.boundary.crud.user import user_crud
from backend.boundary.crud.dataset import dataset_crud
from backend.boundary.crud.schema_deduction import schema_deduction_crud
from backend.boundary.crud.eda_report import eda_report_crud
from backend.boundary.crud.pipeline import pipeline_crud
from backend.boundary.crud.training_job import training_job_crud
from backend.boundary.crud.model import model_crud
from backend.boundary.crud.experiment_run import experiment_run_crud

__all__ = [
    "CRUDBase",
    "user_crud",
    "dataset_crud",
    "schema_deduction_crud",
    "eda_report_crud",
    "pipeline_crud",
    "training_job_crud",
    "model_crud",
    "experiment_run_crud",
]
