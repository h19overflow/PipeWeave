"""Agent configuration loader.

Loads and validates agent configuration from YAML file.
"""

from pathlib import Path
from typing import Any, Dict, List

import yaml
from pydantic import BaseModel, Field


class LLMConfig(BaseModel):
    """LLM configuration."""

    provider: str = Field(..., description="LLM provider name")
    model: str = Field(..., description="Model identifier")
    temperature: float = Field(0.1, ge=0.0, le=1.0)
    max_tokens: int = Field(2048, gt=0)
    timeout: int = Field(10, gt=0, description="Timeout in seconds")


class ToolsConfig(BaseModel):
    """Tool configuration."""

    enabled: List[str] = Field(
        default_factory=list, description="List of enabled tool names"
    )
    retry: Dict[str, Any] = Field(default_factory=dict)


class AgentConfig(BaseModel):
    """Complete agent configuration."""

    agent: Dict[str, Any]
    llm: LLMConfig
    tools: ToolsConfig
    output: Dict[str, Any]
    performance: Dict[str, Any]
    confidence_thresholds: Dict[str, float]
    logging: Dict[str, Any]


def load_agent_config(config_path: Path | None = None) -> AgentConfig:
    """Load agent configuration from YAML file.

    Args:
        config_path: Path to config file. If None, uses default location.

    Returns:
        Validated AgentConfig object
    """
    if config_path is None:
        # Default to config file in same directory
        config_dir = Path(__file__).parent
        config_path = config_dir / "agent_config.yaml"

    with open(config_path, "r", encoding="utf-8") as f:
        config_dict = yaml.safe_load(f)

    return AgentConfig(**config_dict)
