"""
Pipeline Validator Abstract Base Class.

Defines contract for ML pipeline DAG validation strategies.
Layer: 3 (Business Logic)
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Tuple


class BasePipelineValidator(ABC):
    """
    Abstract base class for pipeline validation strategies.

    Implementations must validate pipeline DAG configurations for:
    - Structural integrity (no cycles, valid dependencies)
    - Operation compatibility (data type constraints)
    - Parameter validity (required params, valid ranges)
    """

    @abstractmethod
    def validate_pipeline(
        self,
        pipeline: Dict[str, Any],
    ) -> Tuple[bool, List[str], List[str]]:
        """
        Validate complete pipeline configuration.

        Checks for:
        - DAG structure (no cycles, all dependencies exist)
        - Step validity (valid operations, required parameters)
        - Data flow compatibility (input/output types match)

        Args:
            pipeline: Pipeline DAG configuration to validate

        Returns:
            Tuple of (is_valid, errors, warnings):
                - is_valid: True if pipeline is executable
                - errors: List of error messages (blocks execution)
                - warnings: List of warning messages (non-blocking)

        Example:
            validator = PipelineValidator()
            valid, errors, warnings = validator.validate_pipeline(pipeline)
            if not valid:
                raise ValueError(f"Invalid pipeline: {errors}")
        """
        pass

    @abstractmethod
    def check_cycles(
        self,
        pipeline: Dict[str, Any],
    ) -> Tuple[bool, List[str]]:
        """
        Check for cycles in pipeline DAG.

        Args:
            pipeline: Pipeline DAG configuration

        Returns:
            Tuple of (has_cycles, cycle_paths):
                - has_cycles: True if cycles detected
                - cycle_paths: List of step IDs forming cycles
        """
        pass

    @abstractmethod
    def check_dependencies(
        self,
        pipeline: Dict[str, Any],
    ) -> Tuple[bool, List[str]]:
        """
        Check if all step dependencies exist.

        Args:
            pipeline: Pipeline DAG configuration

        Returns:
            Tuple of (all_exist, missing_deps):
                - all_exist: True if all dependencies valid
                - missing_deps: List of missing dependency references
        """
        pass
