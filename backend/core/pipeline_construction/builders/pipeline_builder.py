"""
Pipeline Builder Abstract Base Class.

Defines contract for ML pipeline DAG construction strategies.
Layer: 3 (Business Logic)
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List

import pandas as pd


class BasePipelineBuilder(ABC):
    """
    Abstract base class for ML pipeline construction strategies.

    Implementations must build ML pipeline DAGs from datasets and configurations.
    A pipeline DAG is a directed acyclic graph where nodes represent ML operations
    (preprocessing, feature engineering, model training) and edges represent dependencies.

    Example DAG structure:
        {
            "steps": [
                {
                    "id": "step_1",
                    "type": "preprocessing",
                    "operation": "handle_missing",
                    "parameters": {"strategy": "mean"},
                    "depends_on": []
                },
                {
                    "id": "step_2",
                    "type": "feature_engineering",
                    "operation": "standard_scaler",
                    "parameters": {},
                    "depends_on": ["step_1"]
                }
            ]
        }
    """

    @abstractmethod
    def build_pipeline(
        self,
        df: pd.DataFrame,
        target_column: str,
        task_type: str,
    ) -> Dict[str, Any]:
        """
        Build ML pipeline configuration from dataset analysis.

        Analyzes the DataFrame to determine appropriate preprocessing,
        feature engineering, and model training steps. Returns a DAG
        configuration ready for validation and execution.

        Args:
            df: Input DataFrame to analyze
            target_column: Name of target variable column
            task_type: "classification" or "regression"

        Returns:
            Pipeline DAG configuration dictionary with:
                - "steps": List of pipeline step configurations
                - "metadata": Optional pipeline metadata (dataset info, etc.)

        Raises:
            ValueError: If target_column not in DataFrame or task_type invalid
        """
        pass

    @abstractmethod
    def add_step(
        self,
        pipeline: Dict[str, Any],
        step_id: str,
        step_type: str,
        operation: str,
        parameters: Dict[str, Any],
        depends_on: List[str],
    ) -> Dict[str, Any]:
        """
        Add a step to an existing pipeline configuration.

        Args:
            pipeline: Existing pipeline configuration
            step_id: Unique identifier for the new step
            step_type: Step category (preprocessing, feature_engineering, etc.)
            operation: Specific operation (handle_missing, standard_scaler, etc.)
            parameters: Step-specific parameters
            depends_on: List of step IDs this step depends on

        Returns:
            Updated pipeline configuration with new step added

        Raises:
            ValueError: If step_id already exists or depends_on references missing steps
        """
        pass

    @abstractmethod
    def remove_step(
        self,
        pipeline: Dict[str, Any],
        step_id: str,
    ) -> Dict[str, Any]:
        """
        Remove a step from pipeline configuration.

        Args:
            pipeline: Existing pipeline configuration
            step_id: ID of step to remove

        Returns:
            Updated pipeline configuration with step removed

        Raises:
            ValueError: If step_id not found or other steps depend on it
        """
        pass
