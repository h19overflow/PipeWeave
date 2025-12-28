"""
Base Pydantic schemas for API responses.

Provides versioned response wrappers and standardized error formats
for consistent API contracts across all endpoints.

Layer: 2 (API)
Dependencies: pydantic, typing, enum
"""

from enum import Enum
from typing import Any, Dict, Generic, Optional, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class ErrorCode(str, Enum):
    """Standard error codes for API responses."""

    VALIDATION_ERROR = "validation_error"
    NOT_FOUND = "not_found"
    ALREADY_EXISTS = "already_exists"
    INTERNAL_ERROR = "internal_error"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    RATE_LIMITED = "rate_limited"
    SERVICE_UNAVAILABLE = "service_unavailable"
    INVALID_STATE = "invalid_state"


class ErrorResponse(BaseModel):
    """
    Standardized error response format.

    Used for all API error responses to ensure consistent error handling
    across frontend and backend.

    Example:
        {
            "code": "not_found",
            "message": "Dataset with ID 123 not found",
            "details": {"dataset_id": "123"}
        }
    """

    code: ErrorCode = Field(
        description="Machine-readable error code for client handling"
    )
    message: str = Field(
        description="Human-readable error description"
    )
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context for debugging"
    )


class VersionedResponse(BaseModel, Generic[T]):
    """
    Generic versioned response wrapper.

    Wraps all successful API responses with version metadata to enable
    future API evolution without breaking existing clients.

    Example:
        {
            "version": "v1",
            "data": {"id": "123", "name": "My Dataset"}
        }
    """

    version: str = Field(
        default="v1",
        description="API version for this response format"
    )
    data: T = Field(
        description="Actual response payload"
    )

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "version": "v1",
                "data": {"example": "payload"}
            }
        }


class HealthCheckResponse(BaseModel):
    """
    Health check endpoint response.

    Used by load balancers and monitoring systems to verify service health.
    """

    status: str = Field(default="healthy")
    version: str = Field(description="Application version")
    uptime_seconds: float = Field(description="Service uptime in seconds")
    database_connected: bool = Field(description="Database connectivity status")
    redis_connected: bool = Field(description="Redis connectivity status")
    s3_connected: bool = Field(description="S3 connectivity status")
