"""
S3 Integration Spike - Validates LocalStack S3 works correctly.

Purpose: Throwaway validation script to prove S3 integration
Layer: Spike (temporary validation code)
Dependencies: boto3, requests, backend.configuration

Run: python -m backend.spikes.spike_s3_integration
"""

import hashlib
import io
from typing import Optional

import boto3
import requests
from botocore.config import Config
from botocore.exceptions import ClientError

from backend.configuration.settings import get_settings


def calculate_sha256(content: bytes) -> str:
    """Calculate SHA-256 hash of content."""
    return hashlib.sha256(content).hexdigest()


def create_test_csv_content() -> bytes:
    """Generate test CSV content."""
    csv_content = (
        "sepal_length,sepal_width,petal_length,petal_width,species\n"
        "5.1,3.5,1.4,0.2,setosa\n"
        "4.9,3.0,1.4,0.2,setosa\n"
        "6.3,3.3,6.0,2.5,virginica\n"
    )
    return csv_content.encode("utf-8")


def initialize_s3_client(
    endpoint_url: Optional[str],
    region: str,
    access_key: str,
    secret_key: str
) -> boto3.client:
    """Initialize boto3 S3 client with settings."""
    config = Config(signature_version="s3v4")

    client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=config
    )
    return client


def create_bucket_if_not_exists(client: boto3.client, bucket_name: str) -> bool:
    """Create S3 bucket if it doesn't exist."""
    try:
        client.head_bucket(Bucket=bucket_name)
        print(f"[✓] Bucket '{bucket_name}' already exists")
        return True
    except ClientError:
        try:
            client.create_bucket(Bucket=bucket_name)
            print(f"[✓] Bucket '{bucket_name}' created")
            return True
        except ClientError as e:
            print(f"[✗] Failed to create bucket: {e}")
            return False


def test_presigned_upload(
    client: boto3.client,
    bucket: str,
    test_content: bytes
) -> bool:
    """Test presigned URL upload."""
    s3_key = "test_data/presigned_upload.csv"

    try:
        # Generate presigned POST URL
        presigned_url = client.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": bucket, "Key": s3_key},
            ExpiresIn=300
        )
        print(f"[✓] Presigned upload URL generated")

        # Simulate upload using requests
        response = requests.put(
            presigned_url,
            data=test_content,
            headers={"Content-Type": "text/csv"}
        )

        if response.status_code in (200, 204):
            print(f"[✓] File uploaded via presigned URL")
            return True
        else:
            print(f"[✗] Upload failed: {response.status_code}")
            return False

    except Exception as e:
        print(f"[✗] Presigned upload failed: {e}")
        return False


def test_direct_upload(
    client: boto3.client,
    bucket: str,
    test_content: bytes
) -> bool:
    """Test direct boto3 upload."""
    s3_key = "test_data/direct_upload.csv"

    try:
        client.put_object(
            Bucket=bucket,
            Key=s3_key,
            Body=test_content,
            ContentType="text/csv"
        )
        print(f"[✓] Direct upload successful")
        return True
    except ClientError as e:
        print(f"[✗] Direct upload failed: {e}")
        return False


def test_download_and_verify(
    client: boto3.client,
    bucket: str,
    original_content: bytes
) -> bool:
    """Test file download and hash verification."""
    s3_key = "test_data/direct_upload.csv"
    original_hash = calculate_sha256(original_content)

    try:
        response = client.get_object(Bucket=bucket, Key=s3_key)
        downloaded_content = response["Body"].read()
        downloaded_hash = calculate_sha256(downloaded_content)

        if original_hash == downloaded_hash:
            print(f"[✓] File downloaded and verified (SHA-256 match)")
            return True
        else:
            print(f"[✗] Hash mismatch: {original_hash} != {downloaded_hash}")
            return False

    except ClientError as e:
        print(f"[✗] Download failed: {e}")
        return False


def cleanup_test_files(client: boto3.client, bucket: str) -> bool:
    """Delete test files from S3."""
    test_keys = [
        "test_data/presigned_upload.csv",
        "test_data/direct_upload.csv"
    ]

    try:
        for key in test_keys:
            client.delete_object(Bucket=bucket, Key=key)
        print(f"[✓] Test files cleaned up")
        return True
    except ClientError as e:
        print(f"[✗] Cleanup failed: {e}")
        return False


def main() -> None:
    """Run S3 integration spike tests."""
    print("[S3 SPIKE] Starting LocalStack S3 integration test...")

    settings = get_settings()
    s3_settings = settings.s3

    # Initialize S3 client
    client = initialize_s3_client(
        endpoint_url=s3_settings.endpoint_url,
        region=s3_settings.region,
        access_key=s3_settings.access_key_id,
        secret_key=s3_settings.secret_access_key
    )
    print("[✓] S3 client initialized")

    # Create bucket
    if not create_bucket_if_not_exists(client, s3_settings.bucket):
        print("[S3 SPIKE] Failed to create bucket. Exiting.")
        return

    # Generate test content
    test_content = create_test_csv_content()

    # Run tests
    tests_passed = 0
    tests_total = 4

    if test_presigned_upload(client, s3_settings.bucket, test_content):
        tests_passed += 1

    if test_direct_upload(client, s3_settings.bucket, test_content):
        tests_passed += 1

    if test_download_and_verify(client, s3_settings.bucket, test_content):
        tests_passed += 1

    if cleanup_test_files(client, s3_settings.bucket):
        tests_passed += 1

    # Summary
    if tests_passed == tests_total:
        print(f"[S3 SPIKE] All tests passed! ({tests_passed}/{tests_total})")
    else:
        print(f"[S3 SPIKE] Some tests failed ({tests_passed}/{tests_total})")


if __name__ == "__main__":
    main()
