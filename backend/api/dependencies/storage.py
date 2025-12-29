"""
Storage dependency providers.

Provides S3 storage client instances.

Layer: 2 (API)
Dependencies: backend.boundary.storage, backend.configuration
"""

from backend.boundary.storage import S3Storage
from backend.configuration import get_settings


async def get_s3_storage() -> S3Storage:
    """
    Get S3 storage client instance.

    Returns:
        S3Storage: Configured S3 client with settings from configuration
    """
    settings = get_settings()
    return S3Storage(
        bucket_name=settings.s3.bucket,
        region_name=settings.s3.region,
        endpoint_url=settings.s3.endpoint_url,
    )
