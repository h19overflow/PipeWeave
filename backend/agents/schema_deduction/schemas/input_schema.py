"""Input schema for schema deduction agent.

Defines the structure of data sent to the agent for analysis.
"""

from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class ColumnSample(BaseModel):
    """Sample values for a single column."""

    name: str = Field(..., description="Column name from CSV header")
    sample_values: List[str] = Field(
        ...,
        description="First N sample values from column (max 10 rows)",
        max_length=10,
    )


class SchemaDeductionInput(BaseModel):
    """Input data for schema deduction agent.

    Contains dataset identifier and column samples for analysis.
    """

    dataset_id: UUID = Field(..., description="Dataset UUID in database")
    columns: List[ColumnSample] = Field(
        ..., description="List of columns with sample values"
    )
    max_samples: int = Field(
        default=10,
        description="Maximum sample values per column",
        ge=5,
        le=50,
    )

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
                "columns": [
                    {
                        "name": "age",
                        "sample_values": ["28", "35", "42", "19", "31"],
                    },
                    {
                        "name": "hire_date",
                        "sample_values": [
                            "2023-01-15",
                            "2021-06-20",
                            "2022-03-10",
                        ],
                    },
                ],
                "max_samples": 10,
            }
        }
