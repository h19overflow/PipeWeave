"""Schema Deduction Agent Module.

AI-powered CSV schema type detection using LangChain tool-calling pattern.

Architecture:
- LangChain AgentExecutor with create_tool_calling_agent
- Google Gemini 3 Flash Preview LLM
- Structured Pydantic output
- Tool-calling pattern for deterministic schema detection

Components:
- agent.py:23 - SchemaDeductionAgent orchestrator (refactored)
- tools/ - Type detection, confidence estimation, datetime formatting
- schemas/ - Pydantic input/output models
- prompts/ - System prompt templates
- config/ - Agent configuration (YAML)
"""

from .agent import SchemaDeductionAgent
from .schemas import (
    ColumnTypeRecommendation,
    SchemaDeductionInput,
    SchemaDeductionOutput,
)

__version__ = "2.0.0"

__all__ = [
    "SchemaDeductionAgent",
    "SchemaDeductionInput",
    "SchemaDeductionOutput",
    "ColumnTypeRecommendation",
]
