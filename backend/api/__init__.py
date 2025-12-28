"""
API package exports.

Exports FastAPI application instance for uvicorn server.

Layer: 2 (API)
"""

from backend.api.main import app

__all__ = ["app"]
