"""
Common reusable Pydantic schemas for API.

Provides pagination, sorting, and filtering primitives used across
multiple API endpoints.

Layer: 2 (API)
Dependencies: pydantic, typing, enum
"""

from enum import Enum
from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field, field_validator


T = TypeVar("T")


class SortOrder(str, Enum):
    """Sort order for list queries."""

    ASC = "asc"
    DESC = "desc"


class FilterOperator(str, Enum):
    """Filter operators for query parameters."""

    EQUALS = "eq"
    NOT_EQUALS = "ne"
    GREATER_THAN = "gt"
    GREATER_OR_EQUAL = "gte"
    LESS_THAN = "lt"
    LESS_OR_EQUAL = "lte"
    CONTAINS = "contains"
    IN = "in"
    NOT_IN = "not_in"


class PaginationParams(BaseModel):
    """
    Cursor-based pagination parameters.

    Uses opaque cursor strings instead of page numbers for consistent
    results when data changes during pagination.

    Example:
        GET /datasets?cursor=abc123&limit=50
    """

    cursor: Optional[str] = Field(
        default=None,
        description="Opaque cursor for next page (from previous response)"
    )
    limit: int = Field(
        default=50,
        ge=1,
        le=100,
        description="Maximum records per page"
    )

    @field_validator("cursor")
    @classmethod
    def validate_cursor(cls, v: Optional[str]) -> Optional[str]:
        """Ensure cursor is not empty string."""
        if v == "":
            return None
        return v


class PaginationMeta(BaseModel):
    """
    Pagination metadata for response.

    Provides information needed for client to fetch next page.
    """

    next_cursor: Optional[str] = Field(
        default=None,
        description="Cursor for next page, None if last page"
    )
    has_more: bool = Field(
        description="Whether more results exist beyond current page"
    )
    total_count: Optional[int] = Field(
        default=None,
        description="Total records (optional, expensive to compute)"
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper.

    Combines data items with pagination metadata for consistent
    list endpoint responses.

    Example:
        {
            "items": [{"id": "1"}, {"id": "2"}],
            "pagination": {
                "next_cursor": "xyz789",
                "has_more": true,
                "total_count": null
            }
        }
    """

    items: List[T] = Field(
        description="Data items for current page"
    )
    pagination: PaginationMeta = Field(
        description="Pagination metadata"
    )


class SortParams(BaseModel):
    """Sorting parameters for list queries."""

    field: str = Field(
        description="Field name to sort by"
    )
    order: SortOrder = Field(
        default=SortOrder.DESC,
        description="Sort direction"
    )


class FilterParams(BaseModel):
    """Generic filter parameters for queries."""

    field: str = Field(description="Field to filter on")
    operator: FilterOperator = Field(description="Comparison operator")
    value: Any = Field(description="Filter value")
