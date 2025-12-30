"""EDA insights agent using create_agent pattern."""

import os
from typing import Dict, Any, List

from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

from .schemas.input_schema import EDAInsightInput
from .schemas.response_schema import EDAInsightOutput, Insight
from .tools import (
    detect_outliers_insight,
    analyze_class_imbalance,
    interpret_correlations,
    missing_value_recommendations,
    generate_summary_recommendation,
)
from .config.agent_config import load_agent_config
from .prompts.system_prompt import SYSTEM_PROMPT
from dotenv import load_dotenv  

load_dotenv()

def generate_eda_insights(eda_summary: Dict[str, Any]) -> Dict[str, Any]:
    """Generate AI-enhanced insights from EDA summary."""
    eda_input = EDAInsightInput(**eda_summary)
    agent = EDAInsightAgent()
    return agent.analyze(eda_input)


class EDAInsightAgent:
    """EDA insights using LangChain create_agent."""

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
            google_api_key=api_key,
        )

    def _create_tools(self) -> List:
        @tool
        def outlier_detection_analyzer(
            column_name: str, outlier_indices: List[int], stats: Dict, total_rows: int
        ) -> Dict:
            """Analyze outliers in numeric columns and recommend handling strategies.

            Identifies extreme values that deviate significantly from the dataset distribution.
            Severity is classified as:
            - High: >10% outliers (potential data quality issues or valid extreme values)
            - Medium: 1-10% outliers (worth investigation)
            - Low: <1% outliers (minimal impact)

            Recommendations consider:
            - Outlier percentage and distribution shape
            - Whether to remove, transform, or use robust scaling
            - If log transformation is suitable for right-skewed data

            Args:
                column_name: Column being analyzed
                outlier_indices: Row indices containing outliers (IQR-based detection)
                stats: Distribution statistics (mean, std, quartiles)
                total_rows: Total dataset size for percentage calculation

            Returns:
                Insight dict with severity, message, and actionable recommendation
            """
            return detect_outliers_insight(column_name, outlier_indices, stats, total_rows)

        @tool
        def class_distribution_analyzer(column_name: str, value_counts: Dict[str, int]) -> Dict:
            """Detect class imbalance in categorical features and suggest mitigation.

            Identifies when class distribution is highly skewed, which affects:
            - Model training (biased towards majority class)
            - Evaluation metrics (accuracy becomes misleading)
            - Generalization to minority classes

            Severity classifications:
            - High: >10:1 ratio (severe imbalance, requires intervention)
            - Medium: 3-10:1 ratio (moderate imbalance, consider resampling)
            - Low: 1.5-3:1 ratio (mild imbalance, can use class weights)
            - Balanced: <1.5:1 ratio (no action needed)

            Recommendations include:
            - SMOTE oversampling for severe imbalance
            - Undersampling for large datasets with imbalance
            - Class weight adjustment in model training
            - Ensemble methods (BalancedRandomForest) for extreme cases

            Args:
                column_name: Categorical column name
                value_counts: Dictionary of category frequencies

            Returns:
                Insight with severity, imbalance ratio, and resampling strategy
            """
            return analyze_class_imbalance(column_name, value_counts)

        @tool
        def feature_correlation_analyzer(correlation_matrix: Dict, threshold: float = 0.7) -> List[Dict]:
            """Identify strong correlations between features for multicollinearity detection.

            Detects highly correlated feature pairs that may:
            - Reduce model interpretability (which feature drives prediction?)
            - Increase model variance (overfitting on correlated redundancy)
            - Inflate coefficient magnitudes in linear models

            Severity classification:
            - Strong (|r| >= 0.7): Definite multicollinearity, consider feature removal
            - Moderate (0.5-0.7): Worth monitoring, may need investigation

            Recommendations:
            - Feature selection (remove redundant correlated features)
            - PCA for automated correlation handling
            - Domain-informed feature engineering
            - Domain knowledge to decide which correlated feature to keep

            Args:
                correlation_matrix: Nested dict of feature correlations
                threshold: Minimum |r| to report (default 0.7 for strong correlations)

            Returns:
                List of correlation insights with feature pairs and strategies
            """
            return interpret_correlations(correlation_matrix, threshold)

        @tool
        def missing_value_strategy_recommender(
            column_name: str, missing_pct: float, column_type: str, total_rows: int
        ) -> Dict:
            """Recommend imputation strategies based on missingness pattern and type.

            Analyzes missing data to determine:
            - Whether missingness is critical enough to impact modeling
            - Best imputation approach for the column type
            - Risk of information loss vs. data preservation

            Severity levels:
            - High: >20% missing (may need domain knowledge or drop decision)
            - Medium: 5-20% missing (careful imputation selection required)
            - Low: <5% missing (simple imputation usually sufficient)

            Type-specific strategies:
            - Numeric: Mean/Median (simple), KNN/Iterative (preserve relationships)
            - Categorical: Mode (frequent class), Missing category (preserve signal)
            - Datetime: Forward fill (time series), drop rows (if not critical)

            Args:
                column_name: Column with missing values
                missing_pct: Percentage of missing values (0-100)
                column_type: Type (numeric, categorical, datetime)
                total_rows: Total dataset size

            Returns:
                Insight with severity, missing count, and imputation recommendation
            """
            return missing_value_recommendations(column_name, missing_pct, column_type, total_rows)

        return [outlier_detection_analyzer, class_distribution_analyzer, feature_correlation_analyzer, missing_value_strategy_recommender]

    def _get_system_prompt(self) -> str:
        return SYSTEM_PROMPT

    def _create_agent(self):
        return create_agent(self.llm, tools=self.tools, system_prompt=self.system_prompt)

    def analyze(self, eda_input: EDAInsightInput) -> Dict[str, Any]:
        """Analyze EDA data and generate insights."""
        insights = self._generate_insights_direct(eda_input)
        summary = generate_summary_recommendation(insights)
        output = EDAInsightOutput(
            insights=[Insight(**insight) for insight in insights],
            summary_recommendation=summary,
        )
        return output.model_dump()

    def _generate_insights_direct(self, eda_input: EDAInsightInput) -> List[Dict[str, Any]]:
        insights: List[Dict[str, Any]] = []
        total_rows = eda_input.summary.get("rows", 0)

        for column in eda_input.columns:
            if column.type == "numeric" and column.outliers:
                insight = detect_outliers_insight(
                    column_name=column.name,
                    outlier_indices=column.outliers,
                    stats=column.stats or {},
                    total_rows=total_rows,
                )
                insights.append(insight)

        for column in eda_input.columns:
            if column.type == "categorical" and column.value_counts:
                insight = analyze_class_imbalance(
                    column_name=column.name, value_counts=column.value_counts
                )
                if insight.get("severity") != "low" or "imbalance detected" in insight.get(
                    "message", ""
                ):
                    insights.append(insight)

        for column in eda_input.columns:
            if column.missing_pct > 0:
                insight = missing_value_recommendations(
                    column_name=column.name,
                    missing_pct=column.missing_pct,
                    column_type=column.type,
                    total_rows=total_rows,
                )
                insights.append(insight)

        if eda_input.correlations:
            correlation_insights = interpret_correlations(
                correlation_matrix=eda_input.correlations.matrix, threshold=0.7
            )
            insights.extend(correlation_insights)

        return insights
