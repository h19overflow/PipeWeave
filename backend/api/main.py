"""
FastAPI main application setup.

Configures FastAPI app with middleware stack, exception handlers,
and API routers. Entry point for uvicorn server.

Layer: 2 (API)
Dependencies: fastapi, starlette, backend.configuration
"""

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.api.dependencies import get_app_settings
from backend.api.middleware.correlation_id import CorrelationIDMiddleware
from backend.api.middleware.request_timing import RequestTimingMiddleware
from backend.api.schemas import ErrorCode, ErrorResponse, HealthCheckResponse
from backend.configuration import get_settings

logger = structlog.get_logger(__name__)

# Track application startup time for health checks
app_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.

    Handles startup and shutdown events for resource initialization
    and cleanup.

    Args:
        app: FastAPI application instance.
    """
    logger.info("application_startup", app_name=app.title)
    # TODO: Phase 5 - Initialize database connection pool
    # TODO: Phase 5 - Initialize Redis connection pool
    # TODO: Phase 5 - Verify S3 bucket accessibility
    yield
    logger.info("application_shutdown")
    # TODO: Phase 5 - Close database connections
    # TODO: Phase 5 - Close Redis connections


settings = get_settings()

app = FastAPI(
    title="PipeWeave API",
    description="ML workbench for automated pipeline construction and training",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Middleware stack (order matters: CORS → Logging → Correlation → Timing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CorrelationIDMiddleware)
app.add_middleware(RequestTimingMiddleware)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors.

    Converts validation errors to standardized ErrorResponse format.

    Args:
        request: HTTP request that triggered error.
        exc: Validation exception with error details.

    Returns:
        JSONResponse: Formatted error response with 422 status.
    """
    logger.warning(
        "validation_error",
        errors=exc.errors(),
        path=request.url.path,
    )

    error_response = ErrorResponse(
        code=ErrorCode.VALIDATION_ERROR,
        message="Request validation failed",
        details={"errors": exc.errors()},
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    """
    Handle FastAPI HTTP exceptions.

    Maps standard HTTP exceptions to ErrorResponse format.

    Args:
        request: HTTP request that triggered error.
        exc: HTTP exception with status and detail.

    Returns:
        JSONResponse: Formatted error response.
    """
    logger.warning(
        "http_exception",
        status_code=exc.status_code,
        detail=exc.detail,
        path=request.url.path,
    )

    # Map status codes to error codes
    code_mapping = {
        404: ErrorCode.NOT_FOUND,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        429: ErrorCode.RATE_LIMITED,
        503: ErrorCode.SERVICE_UNAVAILABLE,
    }

    error_response = ErrorResponse(
        code=code_mapping.get(exc.status_code, ErrorCode.INTERNAL_ERROR),
        message=str(exc.detail),
        details=None,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """
    Handle unhandled exceptions.

    Catches all exceptions not handled by specific handlers to prevent
    exposing internal error details to clients.

    Args:
        request: HTTP request that triggered error.
        exc: Unhandled exception.

    Returns:
        JSONResponse: Generic error response with 500 status.
    """
    logger.error(
        "unhandled_exception",
        exception=str(exc),
        path=request.url.path,
        exc_info=True,
    )

    error_response = ErrorResponse(
        code=ErrorCode.INTERNAL_ERROR,
        message="An internal error occurred. Please contact support.",
        details=None,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(),
    )


@app.get("/health", response_model=HealthCheckResponse, tags=["System"])
async def health_check() -> HealthCheckResponse:
    """
    Health check endpoint for load balancers.

    Returns:
        HealthCheckResponse: Service health status.
    """
    uptime = time.time() - app_start_time

    # TODO: Phase 5 - Check database connectivity
    # TODO: Phase 5 - Check Redis connectivity
    # TODO: Phase 5 - Check S3 connectivity

    return HealthCheckResponse(
        status="healthy",
        version=settings.app_version,
        uptime_seconds=uptime,
        database_connected=False,  # TODO: Replace with actual check
        redis_connected=False,  # TODO: Replace with actual check
        s3_connected=False,  # TODO: Replace with actual check
    )


# Include v1 router
from backend.api.v1 import v1_router

app.include_router(v1_router, prefix="/api/v1")
