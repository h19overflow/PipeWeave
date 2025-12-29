"""IAM policies component for S3 bucket access control.

Provides:
- IAM role for application (EC2, Lambda, ECS)
- IAM policy for S3 GetObject, PutObject, ListBucket
- Bucket policy to enforce encrypted uploads
"""

import json
from typing import Optional
import pulumi
import pulumi_aws as aws


class S3AccessPolicy(pulumi.ComponentResource):
    """Manages IAM policies and roles for S3 bucket access."""

    def __init__(
        self,
        name: str,
        bucket_arn: str,
        environment: str,
        allow_put: bool = True,
        allow_get: bool = True,
        allow_delete: bool = False,
        require_encryption: bool = True,
        opts: pulumi.ResourceOptions | None = None,
    ) -> None:
        """Initialize S3 access policy component.

        Args:
            name: Policy name prefix
            bucket_arn: ARN of target S3 bucket
            environment: Deployment environment (dev, staging, prod)
            allow_put: Allow PutObject action
            allow_get: Allow GetObject action
            allow_delete: Allow DeleteObject action
            require_encryption: Enforce encryption for uploads
            opts: Pulumi resource options
        """
        super().__init__("pipeweave:iam:S3Policy", name, None, opts)

        # Build allowed actions
        actions = ["s3:ListBucket"]
        if allow_get:
            actions.append("s3:GetObject")
        if allow_put:
            actions.append("s3:PutObject")
        if allow_delete:
            actions.append("s3:DeleteObject")

        # Create IAM policy for application
        policy_document = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": actions,
                    "Resource": [bucket_arn, f"{bucket_arn}/*"],
                }
            ],
        }

        # Add encryption requirement if enabled
        if require_encryption and allow_put:
            policy_document["Statement"].append(
                {
                    "Effect": "Deny",
                    "Action": "s3:PutObject",
                    "Resource": f"{bucket_arn}/*",
                    "Condition": {
                        "StringNotEquals": {
                            "s3:x-amz-server-side-encryption": "AES256"
                        }
                    },
                }
            )

        self.policy = aws.iam.Policy(
            f"{name}-policy",
            policy=pulumi.Output.from_json(pulumi.Output.from_input(policy_document)),
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Create IAM role for application services
        assume_role_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"Service": ["ec2.amazonaws.com", "ecs-tasks.amazonaws.com"]},
                    "Action": "sts:AssumeRole",
                }
            ],
        }

        self.role = aws.iam.Role(
            f"{name}-role",
            assume_role_policy=json.dumps(assume_role_policy),
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Attach policy to role
        self.policy_attachment = aws.iam.RolePolicyAttachment(
            f"{name}-attachment",
            role=self.role.name,
            policy_arn=self.policy.arn,
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Create instance profile for EC2
        self.instance_profile = aws.iam.InstanceProfile(
            f"{name}-instance-profile",
            role=self.role.name,
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Export outputs
        self.register_outputs(
            {
                "policy_arn": self.policy.arn,
                "role_arn": self.role.arn,
                "instance_profile_arn": self.instance_profile.arn,
            }
        )

    def get_role_arn(self) -> str:
        """Return IAM role ARN."""
        return self.role.arn

    def get_policy_arn(self) -> str:
        """Return IAM policy ARN."""
        return self.policy.arn
