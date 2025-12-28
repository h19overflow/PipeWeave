"""S3 presigned URL generation.

Purpose: Generate presigned URLs for temporary S3 access
Layer: Boundary (I/O Gateway)
Dependencies: boto3, typing
"""

from typing import Optional
import logging

import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)


class S3PresignedURLGenerator:
    """Presigned URL generator for S3 operations.

    Handles generation of temporary access URLs for GET and PUT operations.
    """

    def __init__(
        self,
        bucket_name: str,
        region_name: str = "us-east-1",
        endpoint_url: Optional[str] = None
    ):
        """Initialize S3 client.

        Args:
            bucket_name: S3 bucket name
            region_name: AWS region (default: us-east-1)
            endpoint_url: Custom S3 endpoint (for LocalStack/MinIO)
        """
        self.bucket_name = bucket_name
        self.client = boto3.client(
            "s3",
            region_name=region_name,
            endpoint_url=endpoint_url
        )

    def generate_presigned_url(
        self,
        s3_key: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """Generate presigned URL for temporary access.

        Args:
            s3_key: S3 object key
            expiration: URL validity in seconds (default: 1 hour)

        Returns:
            Presigned URL or None if failed
        """
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": s3_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return None

    def generate_presigned_upload_url(
        self,
        s3_key: str,
        expiration: int = 300,
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """Generate presigned URL for direct client upload.

        Args:
            s3_key: S3 object key where file will be uploaded
            expiration: URL validity in seconds (default: 5 minutes)
            content_type: MIME type for Content-Type constraint

        Returns:
            Presigned PUT URL or None if failed
        """
        try:
            params = {
                "Bucket": self.bucket_name,
                "Key": s3_key
            }
            if content_type:
                params["ContentType"] = content_type

            url = self.client.generate_presigned_url(
                "put_object",
                Params=params,
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned upload URL: {e}")
            return None
