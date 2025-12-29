"""Pipeline builder agent using create_agent pattern."""

import os
from typing import Dict, List

from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool

from backend.agents.pipeline_builder.config.agent_config import load_agent_config
from backend.agents.pipeline_builder.schemas.input_schema import PipelinePlanInput
from backend.agents.pipeline_builder.tools import (
    recommend_imputation_strategy,
    recommend_scaling_strategy,
    recommend_encoding_strategy,
)
from backend.agents.pipeline_builder.prompts.system_prompt import SYSTEM_PROMPT
from dotenv import load_dotenv  

load_dotenv()

class PipelineBuilderAgent:
    """Pipeline Builder using LangChain create_agent."""

    def __init__(self, config_path: str | None = None) -> None:
        self.config = load_agent_config(config_path)
        self.llm = self._initialize_llm()
        self.tools = self._create_tools()
        self.system_prompt = self._get_system_prompt()
        self.agent = self._create_agent()

    def _initialize_llm(self) -> ChatGoogleGenerativeAI:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")

        return ChatGoogleGenerativeAI(
            model=self.config.llm.model,
            temperature=self.config.llm.temperature,
            max_tokens=self.config.llm.max_tokens,
            google_api_key=api_key,
        )

    def _create_tools(self) -> List:
        @tool
        def missing_value_imputation_recommender(
            column_name: str, missing_pct: float, data_type: str, has_outliers: bool
        ) -> str:
            """Recommend optimal imputation strategy for handling missing values.

            Analyzes column characteristics to select between:
            - mean: Simple arithmetic mean (fast, low missingness)
            - median: Robust to outliers (moderate missingness)
            - mode: Most frequent value (categorical columns)
            - knn: Preserves relationships (high missingness, numeric)
            - iterative: MICE algorithm (severe missingness >40%)

            Considers:
            - Missingness percentage (severity level)
            - Column data type (numeric vs. categorical)
            - Presence of outliers (robustness requirement)
            - Information preservation vs. computational cost

            Args:
                column_name: Column identifier
                missing_pct: Percentage of missing values (0-100)
                data_type: Column type ("numeric" or "categorical")
                has_outliers: Whether outliers detected

            Returns:
                Strategy name: "mean" | "median" | "mode" | "knn" | "iterative"
            """
            return recommend_imputation_strategy(
                column_name, missing_pct, data_type, has_outliers
            )

        @tool
        def feature_scaling_recommender(column_stats: Dict, has_outliers: bool) -> str:
            """Recommend optimal scaling strategy for numeric features.

            Analyzes distribution characteristics to select between:
            - standard: Z-score normalization (symmetric, no outliers)
            - robust: IQR-based scaling (handles outliers, skewed data)
            - minmax: Bounded [0, 1] scaling (distribution-agnostic)
            - log_transform: Log transform for severe skewness (>2.0)

            Considers:
            - Presence of outliers (robustness)
            - Distribution skewness (transformation need)
            - Model algorithm sensitivity (linear vs. tree-based)

            Args:
                column_stats: Statistical metrics dict including "skewness"
                has_outliers: Whether outliers detected

            Returns:
                Strategy name: "standard" | "robust" | "minmax" | "log_transform"
            """
            return recommend_scaling_strategy(column_stats, has_outliers)

        @tool
        def categorical_encoding_recommender(unique_values: int, target_correlation: float) -> str:
            """Recommend optimal categorical encoding strategy based on cardinality and predictiveness.

            Analyzes feature characteristics to select between:
            - onehot: Binary vectors for each category (<10 categories)
            - target: Mean-target encoding (10-100 categories, high correlation)
            - ordinal: Sequential integers (ordered categories)
            - hash: Fixed-size hashing (very high cardinality >100)

            Considerations:
            - Cardinality (number of unique categories)
            - Target correlation (predictive strength of feature)
            - Model algorithm (handles high dimensions or not)
            - Feature importance vs. dimensionality trade-off

            Args:
                unique_values: Number of unique categories
                target_correlation: |correlation| with target variable

            Returns:
                Strategy name: "onehot" | "target" | "ordinal" | "hash"
            """
            return recommend_encoding_strategy(unique_values, target_correlation)

        return [missing_value_imputation_recommender, feature_scaling_recommender, categorical_encoding_recommender]

    def _get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def _create_agent(self):
        return create_agent(self.llm, tools=self.tools, system_prompt=self.system_prompt)

    def generate_pipeline(self, input_data: PipelinePlanInput) -> Dict:
        """Generate preprocessing pipeline from EDA summary."""
        column_stats_text = self._format_column_stats(input_data)
        user_message = f"""Generate preprocessing pipeline for:

Dataset ID: {input_data.dataset_id}
Target: {input_data.target_column}
Task: {input_data.task_type}
Rows: {input_data.num_rows}, Columns: {input_data.num_columns}

Column Statistics:
{column_stats_text}

Provide recommendations for all columns."""

        result = self.agent.invoke({"messages": [{"role": "user", "content": user_message}]})
        return self._build_pipeline_config(input_data, result)

    def _format_column_stats(self, input_data: PipelinePlanInput) -> str:
        lines = []
        for col_name, col_stats in input_data.columns.items():
            lines.append(
                f"- {col_name} ({col_stats.data_type}): "
                f"missing={col_stats.missing_pct:.1f}%, "
                f"unique={col_stats.unique_values}, "
                f"outliers={col_stats.has_outliers}"
            )
        return "\n".join(lines)

    def _build_pipeline_config(self, input_data: PipelinePlanInput, result: Dict) -> Dict:
        transformers = []
        numeric_cols = []
        categorical_cols = []

        for col_name, col_stats in input_data.columns.items():
            if col_stats.data_type == "numeric":
                numeric_cols.append(col_name)
            else:
                categorical_cols.append(col_name)

        return {
            "plan_id": f"plan_{input_data.dataset_id}",
            "dataset_id": input_data.dataset_id,
            "transformers": transformers,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "validation_passed": True,
            "validation_errors": [],
            "output_shape": None,
        }
