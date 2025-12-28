"""S3 storage operations (backward compatibility shim).

This file exists for backward compatibility only.
Use: from backend.boundary.storage import S3Storage

Deprecated: from backend.boundary.storage.s3 import S3Storage
"""

from backend.boundary.storage import S3Storage

__all__ = ["S3Storage"]
