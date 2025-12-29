"""Agent configuration loader."""

from pathlib import Path
from typing import Any, Dict

import yaml
from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    """Configuration for pipeline builder agent."""

    llm_provider: str = Field(default="google-genai")
    llm_model: str = Field(default="gemini-1.5-flash")
    temperature: float = Field(default=0.1)
    max_tokens: int = Field(default=2000)
    max_retries: int = Field(default=3)
    timeout_seconds: int = Field(default=30)
    validate_on_sample: bool = Field(default=True)
    sample_size: int = Field(default=100)


def load_agent_config(config_path: Path | None = None) -> AgentConfig:
    """
    Load agent configuration from YAML file.

    Args:
        config_path: Path to YAML config file (optional)

    Returns:
        AgentConfig object
    """
    if config_path is None:
        config_path = Path(__file__).parent / "agent_config.yaml"

    if not config_path.exists():
        return AgentConfig()

    with open(config_path, "r") as f:
        config_data: Dict[str, Any] = yaml.safe_load(f)

    llm_config = config_data.get("llm", {})
    planner_config = config_data.get("planner", {})
    executor_config = config_data.get("executor", {})

    return AgentConfig(
        llm_provider=llm_config.get("provider", "google-genai"),
        llm_model=llm_config.get("model", "gemini-1.5-flash"),
        temperature=llm_config.get("temperature", 0.1),
        max_tokens=llm_config.get("max_tokens", 2000),
        max_retries=planner_config.get("max_retries", 3),
        timeout_seconds=planner_config.get("timeout_seconds", 30),
        validate_on_sample=executor_config.get("validate_on_sample", True),
        sample_size=executor_config.get("sample_size", 100),
    )
