"""Schema models for schema deduction agent."""

from .input_schema import SchemaDeductionInput
from .response_schema import (
    ColumnTypeRecommendation,
    SchemaDeductionOutput,
)

__all__ = [
    "SchemaDeductionInput",
    "ColumnTypeRecommendation",
    "SchemaDeductionOutput",
]
