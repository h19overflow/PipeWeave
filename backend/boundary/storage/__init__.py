"""Storage services for file operations.

This module provides interfaces for external storage systems (S3, local files).

Backward Compatibility:
- S3Storage class combines s3_core and s3_presigned functionality
- All imports from backend.boundary.storage.s3 still work
"""

from backend.boundary.storage.s3_core import S3CoreOperations
from backend.boundary.storage.s3_presigned import S3PresignedURLGenerator


class S3Storage(S3CoreOperations, S3PresignedURLGenerator):
    """Combined S3 storage interface (backward compatible).

    Provides all S3 operations: upload, download, delete, exists, presigned URLs.
    Inherits from S3CoreOperations and S3PresignedURLGenerator.
    """

    pass


__all__ = ["S3Storage", "S3CoreOperations", "S3PresignedURLGenerator"]
