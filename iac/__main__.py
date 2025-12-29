"""Pulumi stack for PipeWeave S3 storage infrastructure.

Orchestrates:
- S3 bucket creation with security controls
- IAM policies for application access
- Stack-specific configurations (dev, staging, prod)
"""

from typing import Dict, Any
import yaml
import pulumi
import pulumi_aws as aws
from components import S3BucketComponent, S3AccessPolicy


def load_config() -> Dict[str, Any]:
    """Load environment-specific configuration from YAML.

    Returns:
        Configuration dictionary for current stack
    """
    stack_name = pulumi.get_stack()
    config_file = f"configs/{stack_name}.yaml"

    try:
        with open(config_file, encoding="utf-8") as f:
            config = yaml.safe_load(f)
        return config
    except FileNotFoundError:
        pulumi.error(f"Configuration file not found: {config_file}")
        return {}


def main() -> None:
    """Deploy S3 infrastructure and IAM policies."""
    # Load configuration
    config = load_config()
    aws_config = config.get("aws", {})
    pipeweave_config = config.get("pipeweave", {})

    # Configure AWS provider
    provider = aws.Provider(
        "aws",
        region=aws_config.get("region", "us-east-1"),
    )

    environment = pipeweave_config.get("environment", pulumi.get_stack())
    s3_config = pipeweave_config.get("s3", {})
    iam_config = pipeweave_config.get("iam", {})
    tags = pipeweave_config.get("tags", {})

    # Create S3 bucket
    s3_bucket = S3BucketComponent(
        "pipeweave",
        environment=environment,
        enable_versioning=s3_config.get("enable_versioning", True),
        enable_encryption=s3_config.get("enable_encryption", True),
        enable_lifecycle=s3_config.get("enable_lifecycle", True),
        lifecycle_days=s3_config.get("lifecycle_days", 90),
        opts=pulumi.ResourceOptions(provider=provider),
    )

    # Create IAM policies and role
    s3_access = S3AccessPolicy(
        "pipeweave",
        bucket_arn=s3_bucket.bucket.arn,
        environment=environment,
        allow_put=iam_config.get("allow_put", True),
        allow_get=iam_config.get("allow_get", True),
        allow_delete=iam_config.get("allow_delete", False),
        require_encryption=iam_config.get("require_encryption", True),
        opts=pulumi.ResourceOptions(provider=provider),
    )

    # Export stack outputs
    pulumi.export("bucket_name", s3_bucket.bucket.id)
    pulumi.export("bucket_arn", s3_bucket.bucket.arn)
    pulumi.export("bucket_region", aws_config.get("region", "us-east-1"))
    pulumi.export("iam_role_arn", s3_access.role.arn)
    pulumi.export("iam_policy_arn", s3_access.policy.arn)
    pulumi.export("instance_profile_arn", s3_access.instance_profile.arn)
    pulumi.export("environment", environment)


if __name__ == "__main__":
    main()
