"""
API dependency injection module.

Re-exports all dependency providers for backward compatibility.

Layer: 2 (API)
Dependencies: fastapi, backend.configuration, backend.boundary
"""

from backend.api.dependencies.auth import get_current_user_id
from backend.api.dependencies.database import get_db, get_engine, get_session_factory
from backend.api.dependencies.services import (
    get_dataset_service,
    get_training_service,
)
from backend.api.dependencies.settings import get_app_settings
from backend.api.dependencies.storage import get_s3_storage

__all__ = [
    # Database
    "get_engine",
    "get_session_factory",
    "get_db",
    # Settings
    "get_app_settings",
    # Storage
    "get_s3_storage",
    # Services
    "get_dataset_service",
    "get_training_service",
    # Auth
    "get_current_user_id",
]
