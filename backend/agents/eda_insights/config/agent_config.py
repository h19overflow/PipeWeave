"""
Agent configuration loader.

This module loads agent configuration from YAML and provides
type-safe access to settings.

Layer: 6 (Agent)
Dependencies: PyYAML, Pydantic
"""

from typing import Dict, Any, List
from pathlib import Path
import yaml
from pydantic import BaseModel, Field


class LLMConfig(BaseModel):
    """LLM configuration settings."""

    provider: str = Field(default="google_genai")
    model: str = Field(default="gemini-2.0-flash-exp")
    temperature: float = Field(default=0.3, ge=0.0, le=1.0)
    max_tokens: int = Field(default=2048, ge=1)
    timeout: int = Field(default=10, ge=1)


class ExecutionConfig(BaseModel):
    """Agent execution configuration."""

    parallel_tool_calls: bool = Field(default=True)
    max_iterations: int = Field(default=3, ge=1)
    early_stopping: bool = Field(default=True)


class AgentConfig(BaseModel):
    """Complete agent configuration."""

    name: str
    description: str
    llm: LLMConfig
    tools: List[str]
    execution: ExecutionConfig


def load_agent_config(config_path: str | Path | None = None) -> AgentConfig:
    """Load agent configuration from YAML file.

    Args:
        config_path: Optional path to config file

    Returns:
        AgentConfig: Validated agent configuration

    Raises:
        FileNotFoundError: If config file does not exist
        ValueError: If config is invalid
    """
    if config_path is None:
        config_path = Path(__file__).parent / "agent_config.yaml"
    else:
        config_path = Path(config_path)

    with open(config_path, "r", encoding="utf-8") as f:
        raw_config = yaml.safe_load(f)

    return AgentConfig(
        name=raw_config["agent"]["name"],
        description=raw_config["agent"]["description"],
        llm=LLMConfig(**raw_config["llm"]),
        tools=raw_config["tools"],
        execution=ExecutionConfig(**raw_config["execution"])
    )


def get_agent_config() -> AgentConfig:
    """Legacy function for backward compatibility."""
    return load_agent_config()
