"""Schema deduction agent using create_agent pattern."""

import os
from pathlib import Path
from typing import List, Dict, Any

from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from .config import load_agent_config
from .prompts import get_system_prompt
from .schemas import SchemaDeductionInput, SchemaDeductionOutput, ColumnTypeRecommendation
from .tools import detect_column_type, estimate_confidence, suggest_datetime_format
from dotenv import load_dotenv  

load_dotenv()


class SchemaDeductionAgent:
    """AI-powered schema deduction using LangChain create_agent."""

    def __init__(self, config_path: Path | None = None) -> None:
        self.config = load_agent_config(config_path)
        self.llm = self._initialize_llm()
        self.tools = self._load_tools()
        self.prompt = get_system_prompt()
        self.agent = self._create_agent()

    def _initialize_llm(self) -> ChatGoogleGenerativeAI:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")

        return ChatGoogleGenerativeAI(
            model=self.config.llm.model,
            temperature=self.config.llm.temperature,
            max_tokens=self.config.llm.max_tokens,
            timeout=self.config.llm.timeout,
            google_api_key=api_key,
        )

    def _load_tools(self) -> List:
        """Load and wrap schema deduction tools with enhanced context."""
        available_tools = {
            "detect_column_type": detect_column_type,
            "estimate_confidence": estimate_confidence,
            "suggest_datetime_format": suggest_datetime_format,
        }
        return [available_tools[name] for name in self.config.tools.enabled]

    def _create_agent(self):
        system_prompt = self.prompt.messages[0].prompt.template
        return create_agent(self.llm, tools=self.tools, system_prompt=system_prompt)

    def deduce_schema(self, input_data: SchemaDeductionInput) -> SchemaDeductionOutput:
        """Deduce schema for dataset columns."""
        columns_text = self._format_columns(input_data)
        user_message = f"Dataset ID: {input_data.dataset_id}\n\nColumns:\n{columns_text}"

        result = self.agent.invoke({
            "messages": [{"role": "user", "content": user_message}]
        })

        return self._parse_agent_output(result, input_data)

    def _format_columns(self, input_data: SchemaDeductionInput) -> str:
        lines = []
        for col in input_data.columns:
            samples = ", ".join(f'"{v}"' for v in col.sample_values[:5])
            lines.append(f"- Column: {col.name}\n  Samples: [{samples}...]")
        return "\n".join(lines)

    def _parse_agent_output(
        self, result: Dict[str, Any], input_data: SchemaDeductionInput
    ) -> SchemaDeductionOutput:
        columns = []
        for col in input_data.columns:
            col_type = detect_column_type(col.name, col.sample_values)
            confidence = estimate_confidence(col.sample_values, col_type)
            datetime_fmt = (
                suggest_datetime_format(col.sample_values)
                if col_type == "datetime"
                else None
            )

            columns.append(
                ColumnTypeRecommendation(
                    name=col.name,
                    suggested_type=col_type,
                    confidence=confidence,
                    reasoning=f"Detected {col_type} based on pattern analysis",
                    datetime_format=datetime_fmt,
                )
            )

        overall_confidence = sum(c.confidence for c in columns) / len(columns)
        return SchemaDeductionOutput(
            columns=columns, overall_confidence=overall_confidence
        )
