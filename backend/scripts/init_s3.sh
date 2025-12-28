#!/bin/bash
# LocalStack S3 initialization script
# Creates S3 bucket and sets up folder structure for development

echo "Initializing S3 bucket in LocalStack..."

# Create main bucket
awslocal s3 mb s3://pipeweave-storage

# Create folder structure (S3 folders are just key prefixes)
awslocal s3api put-object --bucket pipeweave-storage --key datasets/
awslocal s3api put-object --bucket pipeweave-storage --key models/
awslocal s3api put-object --bucket pipeweave-storage --key cache/

# Enable versioning for models (rollback capability)
awslocal s3api put-bucket-versioning \
  --bucket pipeweave-storage \
  --versioning-configuration Status=Enabled

echo "S3 bucket 'pipeweave-storage' created successfully!"
echo "Folder structure: datasets/, models/, cache/"
