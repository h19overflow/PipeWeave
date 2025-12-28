"""
Request timing middleware for performance monitoring.

Measures request processing duration and logs timing metrics for
performance analysis and SLA monitoring.

Layer: 2 (API)
Dependencies: starlette, structlog, time
"""

import time
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import structlog


logger = structlog.get_logger(__name__)


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that tracks request processing time.

    Measures elapsed time from request receipt to response completion.
    Adds X-Process-Time header with duration in seconds and logs timing.

    Example:
        Request received at T0 → processed for 0.342s → response includes:
        X-Process-Time: 0.342
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """
        Process request with timing measurement.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler

        Returns:
            Response: HTTP response with X-Process-Time header
        """
        start_time = time.perf_counter()

        response = await call_next(request)

        elapsed_time = time.perf_counter() - start_time

        # Add timing header
        response.headers["X-Process-Time"] = f"{elapsed_time:.3f}"

        logger.info(
            "request_completed",
            duration_seconds=round(elapsed_time, 3),
            status_code=response.status_code,
        )

        return response
