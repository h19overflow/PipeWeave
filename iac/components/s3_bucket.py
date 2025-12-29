"""S3 bucket component for PipeWeave storage layer.

Provides:
- S3 bucket creation with versioning and encryption
- Block public access settings
- Lifecycle policies for cost optimization
"""

from typing import Optional
import pulumi
import pulumi_aws as aws


class S3BucketComponent(pulumi.ComponentResource):
    """Manages S3 bucket with security and operational best practices."""

    def __init__(
        self,
        name: str,
        environment: str,
        enable_versioning: bool = True,
        enable_encryption: bool = True,
        enable_lifecycle: bool = True,
        lifecycle_days: int = 90,
        opts: pulumi.ResourceOptions | None = None,
    ) -> None:
        """Initialize S3 bucket component.

        Args:
            name: Bucket name prefix (will be suffixed with environment)
            environment: Deployment environment (dev, staging, prod)
            enable_versioning: Enable S3 versioning for data protection
            enable_encryption: Enable server-side encryption
            enable_lifecycle: Enable lifecycle rules for old objects
            lifecycle_days: Days before transitioning to GLACIER
            opts: Pulumi resource options
        """
        super().__init__("pipeweave:s3:Bucket", name, None, opts)

        # Bucket name must be globally unique and lowercase
        bucket_name = f"pipeweave-{name}-{environment}-{pulumi.get_stack()}"
        bucket_name = bucket_name.lower().replace("_", "-")

        # Create S3 bucket
        self.bucket = aws.s3.Bucket(
            f"{name}-bucket",
            bucket=bucket_name,
            acl="private",
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Enable versioning
        if enable_versioning:
            self.versioning = aws.s3.BucketVersioningV2(
                f"{name}-versioning",
                bucket=self.bucket.id,
                versioning_configuration=aws.s3.BucketVersioningV2VersioningConfigurationArgs(
                    status="Enabled",
                ),
                opts=pulumi.ResourceOptions(parent=self),
            )

        # Enable server-side encryption
        if enable_encryption:
            self.encryption = aws.s3.BucketServerSideEncryptionConfigurationV2(
                f"{name}-encryption",
                bucket=self.bucket.id,
                rules=[
                    aws.s3.BucketServerSideEncryptionConfigurationV2RuleArgs(
                        apply_server_side_encryption_by_default=aws.s3.BucketServerSideEncryptionConfigurationV2RuleApplyServerSideEncryptionByDefaultArgs(
                            sse_algorithm="AES256",
                        ),
                    )
                ],
                opts=pulumi.ResourceOptions(parent=self),
            )

        # Block public access
        self.public_access_block = aws.s3.BucketPublicAccessBlock(
            f"{name}-public-access-block",
            bucket=self.bucket.id,
            block_public_acls=True,
            block_public_policy=True,
            ignore_public_acls=True,
            restrict_public_buckets=True,
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Lifecycle rules (optional)
        if enable_lifecycle:
            self.lifecycle = aws.s3.BucketLifecycleConfigurationV2(
                f"{name}-lifecycle",
                bucket=self.bucket.id,
                rules=[
                    aws.s3.BucketLifecycleConfigurationV2RuleArgs(
                        id="transition-to-glacier",
                        status="Enabled",
                        transitions=[
                            aws.s3.BucketLifecycleConfigurationV2RuleTransitionArgs(
                                days=lifecycle_days,
                                storage_class="GLACIER",
                            )
                        ],
                    )
                ],
                opts=pulumi.ResourceOptions(parent=self),
            )

        # Export outputs
        self.register_outputs({"bucket_id": self.bucket.id, "bucket_arn": self.bucket.arn})

    def get_bucket_name(self) -> str:
        """Return bucket name."""
        return self.bucket.id

    def get_bucket_arn(self) -> str:
        """Return bucket ARN."""
        return self.bucket.arn
