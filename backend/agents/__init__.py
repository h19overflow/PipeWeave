"""AI Agents Module.

LangChain-based agents for automated ML workflow assistance.

Available Agents:
- schema_deduction: AI-powered CSV schema type detection
- pipeline_builder: AI-driven preprocessing pipeline builder
- eda_insights: AI-enhanced EDA insights generation
"""

from .schema_deduction import SchemaDeductionAgent
from .pipeline_builder import PipelineBuilderAgent
from .eda_insights import generate_eda_insights, EDAInsightAgent

__all__ = [
    "SchemaDeductionAgent",
    "PipelineBuilderAgent",
    "EDAInsightAgent",
    "generate_eda_insights",
]
