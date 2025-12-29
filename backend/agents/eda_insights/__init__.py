"""EDA Insights Agent: AI-Enhanced EDA Analysis.

Refactored to use LangChain tool-calling pattern with Gemini 3 Flash Preview
for interpreting ydata-profiling results and generating actionable insights.

Architecture:
- LangChain AgentExecutor with create_tool_calling_agent
- Google Gemini 3 Flash Preview LLM
- Direct tool execution for deterministic insights
- Tool-based analysis (outliers, imbalance, correlations, missing values)

Layer: 6 (Agent)
Dependencies: LangChain, Google Gemini
"""

from .agent import generate_eda_insights, EDAInsightAgent

__version__ = "2.0.0"

__all__ = ["generate_eda_insights", "EDAInsightAgent"]
