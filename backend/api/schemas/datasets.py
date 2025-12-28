"""
Dataset-related Pydantic schemas.

Request/response models for dataset upload, status tracking,
and listing operations.

Layer: 2 (API)
Dependencies: pydantic, typing, datetime
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel, Field


class DatasetStatus(str, Enum):
    """Dataset processing status (matches database constraint)."""

    UPLOADING = "uploading"
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    VALIDATED = "validated"
    FAILED = "failed"


class DatasetUploadURLRequest(BaseModel):
    """
    Request for presigned S3 upload URL.

    Client initiates multipart upload by requesting presigned URL
    for direct S3 upload without routing data through API server.

    Example:
        {
            "filename": "training_data.csv",
            "content_type": "text/csv",
            "size_bytes": 52428800
        }
    """

    filename: str = Field(
        min_length=1,
        max_length=255,
        description="Original filename with extension"
    )
    content_type: str = Field(
        default="text/csv",
        description="MIME type of file"
    )
    size_bytes: int = Field(
        gt=0,
        description="File size in bytes for validation"
    )


class DatasetUploadURLResponse(BaseModel):
    """
    Presigned S3 upload URL response.

    Contains temporary upload URL and dataset tracking ID.
    """

    upload_url: str = Field(description="Presigned S3 URL for PUT upload")
    dataset_id: str = Field(description="UUID for tracking this dataset")
    expires_at: datetime = Field(description="URL expiration timestamp")


class DatasetResponse(BaseModel):
    """
    Dataset details response.

    Full dataset information including status and metadata.
    """

    id: str = Field(description="Dataset UUID")
    name: str = Field(description="Dataset name")
    status: DatasetStatus = Field(description="Processing status")
    file_size_bytes: int = Field(description="File size in bytes")
    num_rows: Optional[int] = Field(
        default=None, description="Number of rows (after validation)"
    )
    num_columns: Optional[int] = Field(
        default=None, description="Number of columns (after validation)"
    )
    created_at: datetime = Field(description="Upload initiation time")


class DatasetListItem(BaseModel):
    """Lightweight dataset item for list views."""

    id: str = Field(description="Dataset UUID")
    name: str = Field(description="Dataset name")
    status: DatasetStatus = Field(description="Processing status")
    created_at: datetime = Field(description="Upload time")


class DatasetCompleteRequest(BaseModel):
    """
    Signal that client completed S3 upload.

    Triggers backend validation and processing pipeline.
    """

    file_hash: str = Field(description="SHA-256 hash of uploaded file")
