"""Dataset validation utilities.

Purpose: Input validation for dataset operations
Layer: Services (Business Logic)
Dependencies: typing
"""

from uuid import UUID

from backend.boundary.models.dataset import Dataset


class DatasetValidator:
    """Validate dataset operations and inputs."""

    @staticmethod
    def validate_create_inputs(filename: str, file_size_bytes: int) -> None:
        """Validate dataset creation inputs.

        Args:
            filename: Original filename
            file_size_bytes: File size in bytes

        Raises:
            ValueError: If validation fails
        """
        if not filename or not filename.strip():
            raise ValueError("Filename cannot be empty")
        if file_size_bytes <= 0:
            raise ValueError("File size must be greater than 0")

    @staticmethod
    def validate_upload_url_request(dataset: Dataset | None, dataset_id: UUID) -> None:
        """Validate dataset for upload URL generation.

        Args:
            dataset: Dataset instance or None
            dataset_id: Dataset UUID for error messages

        Raises:
            ValueError: If dataset not found or invalid status
        """
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")
        if dataset.status != "uploading":
            raise ValueError(
                f"Dataset {dataset_id} status is '{dataset.status}', expected 'uploading'"
            )

    @staticmethod
    def validate_status_transition(
        dataset: Dataset | None, dataset_id: UUID, expected_status: str
    ) -> None:
        """Validate dataset exists and has expected status.

        Args:
            dataset: Dataset instance or None
            dataset_id: Dataset UUID for error messages
            expected_status: Expected status value

        Raises:
            ValueError: If dataset not found or wrong status
        """
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")
        if dataset.status != expected_status:
            raise ValueError(
                f"Dataset {dataset_id} status is '{dataset.status}', "
                f"expected '{expected_status}'"
            )
