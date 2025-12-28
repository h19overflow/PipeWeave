"""
Structured logging configuration for PipeWeave.

Provides centralized logging setup with correlation IDs, JSON formatting,
and environment-aware log levels.

Layer: 7 (Configuration)
Dependencies: logging, structlog, typing
"""

import logging
import sys
from typing import Any, Dict, Optional
from contextvars import ContextVar

import structlog
from structlog.types import EventDict, Processor

from backend.configuration.settings import get_settings


# Context variable for correlation ID tracking across async boundaries
correlation_id_var: ContextVar[Optional[str]] = ContextVar(
    "correlation_id", default=None
)


def add_correlation_id(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    """
    Add correlation ID to log context.

    Args:
        logger: Logger instance
        method_name: Logging method name
        event_dict: Event dictionary to enhance

    Returns:
        EventDict: Enhanced event dictionary with correlation ID
    """
    correlation_id = correlation_id_var.get()
    if correlation_id:
        event_dict["correlation_id"] = correlation_id
    return event_dict


def drop_color_message_key(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    """
    Remove color_message key from event dict (structlog internal)."""
    event_dict.pop("color_message", None)
    return event_dict


def configure_logging(log_level: Optional[str] = None) -> None:
    """
    Configure structured logging for the application.

    Sets up structlog with JSON formatting for production and
    console-friendly output for development.

    Args:
        log_level: Optional override for log level (defaults to settings)

    Example:
        >>> from backend.configuration.logging import configure_logging
        >>> configure_logging("DEBUG")
    """
    settings = get_settings()
    level = log_level or settings.log_level

    # Shared processors for all configurations
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        add_correlation_id,
        drop_color_message_key,
    ]

    # Choose renderer based on debug mode
    if settings.debug:
        # Development: Human-readable console output
        renderer = structlog.dev.ConsoleRenderer(colors=True)
    else:
        # Production: JSON output for log aggregation
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(level.upper())

    # Silence noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Get a structured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        BoundLogger: Configured structured logger

    Example:
        >>> from backend.configuration.logging import get_logger
        >>> logger = get_logger(__name__)
        >>> logger.info("Processing dataset", dataset_id=123)
    """
    return structlog.get_logger(name)


def set_correlation_id(correlation_id: str) -> None:
    """
    Set correlation ID for current execution context.

    Args:
        correlation_id: Unique identifier for request/task chain

    Example:
        >>> import uuid
        >>> from backend.configuration.logging import set_correlation_id
        >>> set_correlation_id(str(uuid.uuid4()))
    """
    correlation_id_var.set(correlation_id)


def get_correlation_id() -> Optional[str]:
    """
    Get current correlation ID.

    Returns:
        Optional[str]: Correlation ID if set, None otherwise
    """
    return correlation_id_var.get()
