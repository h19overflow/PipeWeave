"""Abstract base classes for pipeline construction."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BasePipelineBuilder(ABC):
    """Abstract base for pipeline construction from configuration."""

    @abstractmethod
    def build(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Build executable pipeline from configuration."""
        pass

    @abstractmethod
    def optimize(self, pipeline: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize existing pipeline."""
        pass


class BasePipelineValidator(ABC):
    """Abstract base for pipeline validation."""

    @abstractmethod
    def validate(self, pipeline: Dict[str, Any]) -> Dict[str, Any]:
        """Validate pipeline structure and dependencies."""
        pass

    @abstractmethod
    def get_validation_errors(self) -> List[str]:
        """Get list of validation errors."""
        pass
