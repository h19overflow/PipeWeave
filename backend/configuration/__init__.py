"""
Configuration layer package.

Provides centralized configuration management and structured logging.
See backend/configuration/CLAUDE.md for complete documentation.
"""

from backend.configuration.settings import (
    Settings,
    DatabaseSettings,
    RedisSettings,
    S3Settings,
    GeminiSettings,
    SecuritySettings,
    CORSSettings,
    CelerySettings,
    get_settings,
)
from backend.configuration.logging import (
    configure_logging,
    get_logger,
    set_correlation_id,
    get_correlation_id,
)

__all__ = [
    # Settings classes
    "Settings",
    "DatabaseSettings",
    "RedisSettings",
    "S3Settings",
    "GeminiSettings",
    "SecuritySettings",
    "CORSSettings",
    "CelerySettings",
    "get_settings",
    # Logging utilities
    "configure_logging",
    "get_logger",
    "set_correlation_id",
    "get_correlation_id",
]
