"""Dataset API endpoints (backward compatibility shim).

This file exists for backward compatibility only.
Use: from backend.api.v1.datasets import router

Deprecated: from backend.api.v1 import datasets
"""

from backend.api.v1.datasets import router

__all__ = ["router"]
