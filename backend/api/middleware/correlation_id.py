"""
Correlation ID middleware for request tracing.

Generates a unique UUID for each HTTP request and injects it into the
structlog context for distributed tracing across service boundaries.

Layer: 2 (API)
Dependencies: starlette, structlog, uuid
"""

import uuid
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import structlog


logger = structlog.get_logger(__name__)


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that generates and tracks correlation IDs for requests.

    Extracts correlation ID from X-Correlation-ID header if present,
    otherwise generates a new UUID. Injects ID into structlog context
    and adds X-Correlation-ID header to response.

    Example:
        Request without header → generates new UUID → logs include correlation_id
        Request with X-Correlation-ID: abc → uses "abc" → propagates to response
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """
        Process request with correlation ID tracking.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler

        Returns:
            Response: HTTP response with X-Correlation-ID header
        """
        correlation_id = request.headers.get(
            "X-Correlation-ID", str(uuid.uuid4())
        )

        # Bind correlation ID to structlog context
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            correlation_id=correlation_id,
            path=request.url.path,
            method=request.method,
        )

        logger.info(
            "request_started",
            correlation_id=correlation_id,
            client_host=request.client.host if request.client else None,
        )

        response = await call_next(request)

        # Inject correlation ID into response headers
        response.headers["X-Correlation-ID"] = correlation_id

        return response
