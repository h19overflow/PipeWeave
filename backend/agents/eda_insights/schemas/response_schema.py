"""
Response schema for EDA insights agent.

This module defines the structure of AI-generated insights
that will be stored in the database and displayed in the frontend.

Layer: 6 (Agent)
Dependencies: Pydantic
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class Insight(BaseModel):
    """Single AI-generated insight about data quality."""

    type: str = Field(
        description="Insight type: outlier_detection, class_imbalance, missing_values, correlation"
    )
    severity: Literal["high", "medium", "low"] = Field(
        description="Severity level for prioritization"
    )
    column: Optional[str] = Field(
        default=None,
        description="Primary column involved (if applicable)"
    )
    columns: Optional[List[str]] = Field(
        default=None,
        description="Multiple columns involved (e.g., correlation pairs)"
    )
    message: str = Field(
        description="Human-readable description of the issue"
    )
    recommendation: str = Field(
        description="Actionable recommendation with specific techniques"
    )


class EDAInsightOutput(BaseModel):
    """Output from the EDA insights agent."""

    insights: List[Insight] = Field(
        description="List of insights ordered by severity (high -> medium -> low)"
    )
    summary_recommendation: str = Field(
        description="Executive summary of top 3 most critical actions"
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "insights": [
                    {
                        "type": "missing_values",
                        "severity": "high",
                        "column": "Age",
                        "message": "19.9% missing values in 'Age' column (177 of 891 rows)",
                        "recommendation": "Use median imputation for robustness or KNN imputation for better accuracy"
                    },
                    {
                        "type": "class_imbalance",
                        "severity": "medium",
                        "column": "Survived",
                        "message": "Class imbalance detected: 61.6% class 0, 38.4% class 1 (ratio 1.6:1)",
                        "recommendation": "Consider SMOTE oversampling or class_weight='balanced' in model training"
                    }
                ],
                "summary_recommendation": "Focus on handling 19.9% missing values in 'Age' and addressing class imbalance before training."
            }
        }
