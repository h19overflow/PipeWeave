"""Response schema for schema deduction agent.

Defines the structured output format from the LLM.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, confloat


ColumnType = Literal["numeric", "categorical", "datetime", "text", "boolean"]


class ColumnTypeRecommendation(BaseModel):
    """Single column type recommendation with confidence score."""

    name: str = Field(..., description="Column name")
    suggested_type: ColumnType = Field(..., description="Detected data type")
    confidence: confloat(ge=0.0, le=1.0) = Field(
        ..., description="Confidence score (0.0-1.0)"
    )
    reasoning: str = Field(
        ..., description="Explanation for type detection"
    )
    datetime_format: Optional[str] = Field(
        None,
        description="Datetime format pattern (if type is datetime)",
    )

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "name": "hire_date",
                "suggested_type": "datetime",
                "confidence": 0.88,
                "reasoning": "ISO 8601 date format detected",
                "datetime_format": "YYYY-MM-DD",
            }
        }


class SchemaDeductionOutput(BaseModel):
    """Structured output from schema deduction agent."""

    columns: List[ColumnTypeRecommendation] = Field(
        ..., description="Type recommendations for all columns"
    )
    overall_confidence: confloat(ge=0.0, le=1.0) = Field(
        ..., description="Average confidence across all columns"
    )

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "columns": [
                    {
                        "name": "age",
                        "suggested_type": "numeric",
                        "confidence": 0.95,
                        "reasoning": "All samples are integers",
                        "datetime_format": None,
                    }
                ],
                "overall_confidence": 0.91,
            }
        }
