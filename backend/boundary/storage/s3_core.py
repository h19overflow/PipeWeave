"""S3 core file operations.

Purpose: Handle S3 file upload, download, delete, and existence checks
Layer: Boundary (I/O Gateway)
Dependencies: boto3, typing, pathlib
"""

from typing import Optional, BinaryIO
from pathlib import Path
import logging

import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)


class S3CoreOperations:
    """Core S3 file operations interface.

    Handles uploading, downloading, deleting, and checking file existence.
    Uses dependency injection for bucket configuration.
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

    async def upload_file(
        self,
        file_obj: BinaryIO,
        s3_key: str,
        content_type: Optional[str] = None
    ) -> bool:
        """Upload file to S3.

        Args:
            file_obj: File-like object to upload
            s3_key: S3 object key (path)
            content_type: MIME type (optional)

        Returns:
            True if successful, False otherwise

        Raises:
            ClientError: If S3 upload fails
        """
        try:
            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type

            self.client.upload_fileobj(
                file_obj,
                self.bucket_name,
                s3_key,
                ExtraArgs=extra_args
            )
            logger.info(f"Uploaded file to s3://{self.bucket_name}/{s3_key}")
            return True

        except ClientError as e:
            logger.error(f"Failed to upload to S3: {e}")
            raise

    async def download_file(
        self,
        s3_key: str,
        local_path: Path
    ) -> bool:
        """Download file from S3 to local path.

        Args:
            s3_key: S3 object key
            local_path: Local file path to save

        Returns:
            True if successful, False otherwise

        Raises:
            ClientError: If S3 download fails
        """
        try:
            self.client.download_file(
                self.bucket_name,
                s3_key,
                str(local_path)
            )
            logger.info(f"Downloaded s3://{self.bucket_name}/{s3_key}")
            return True

        except ClientError as e:
            logger.error(f"Failed to download from S3: {e}")
            raise

    async def delete_file(self, s3_key: str) -> bool:
        """Delete file from S3.

        Args:
            s3_key: S3 object key

        Returns:
            True if successful, False otherwise

        Raises:
            ClientError: If S3 delete fails
        """
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            logger.info(f"Deleted s3://{self.bucket_name}/{s3_key}")
            return True

        except ClientError as e:
            logger.error(f"Failed to delete from S3: {e}")
            raise

    async def file_exists(self, s3_key: str) -> bool:
        """Check if file exists in S3.

        Args:
            s3_key: S3 object key

        Returns:
            True if exists, False otherwise
        """
        try:
            self.client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except ClientError:
            return False
