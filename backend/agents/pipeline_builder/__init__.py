"""Pipeline Builder Agent: AI-Driven Pipeline Building.

Refactored to use LangChain tool-calling pattern with Gemini 3 Flash Preview
for generating optimal preprocessing pipelines based on EDA results.

Architecture:
- LangChain AgentExecutor with create_tool_calling_agent
- Google Gemini 3 Flash Preview LLM
- Tool-based recommendation system (imputation, scaling, encoding)
"""

from backend.agents.pipeline_builder.agent import PipelineBuilderAgent
from backend.agents.pipeline_builder.schemas.input_schema import PipelinePlanInput
from backend.agents.pipeline_builder.schemas.plan_schema import PreprocessingPlan
from backend.agents.pipeline_builder.schemas.response_schema import PipelineOutput

__version__ = "2.0.0"

__all__ = [
    "PipelineBuilderAgent",
    "PipelinePlanInput",
    "PreprocessingPlan",
    "PipelineOutput",
]
