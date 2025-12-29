"""IAC components package for PipeWeave infrastructure.

Components:
- s3_bucket: S3 bucket with security and lifecycle policies
- iam_policies: IAM roles and policies for S3 access
"""

from .s3_bucket import S3BucketComponent
from .iam_policies import S3AccessPolicy

__all__ = ["S3BucketComponent", "S3AccessPolicy"]
