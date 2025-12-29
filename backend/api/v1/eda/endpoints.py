"""
EDA (Exploratory Data Analysis) API endpoints (v1).

Provides summary statistics and full EDA reports for datasets.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

from datetime import datetime
from typing import List

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import get_app_settings
from backend.api.schemas import (
    ColumnStatistics,
    EDAReportResponse,
    EDASummaryResponse,
    VersionedResponse,
    VisualizationMetadata,
)
from backend.configuration import Settings

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/eda", tags=["EDA"])


@router.get(
    "/datasets/{dataset_id}/summary",
    response_model=VersionedResponse[EDASummaryResponse],
    status_code=status.HTTP_200_OK,
)
async def get_eda_summary(
    dataset_id: str,
    settings: Settings = Depends(get_app_settings),
) -> VersionedResponse[EDASummaryResponse]:
    """
    Get quick EDA summary for dataset.

    Lightweight endpoint returning basic statistics without visualizations.
    Used for initial dataset preview.

    Args:
        dataset_id: Dataset UUID.
        settings: Application settings.

    Returns:
        VersionedResponse containing EDA summary statistics.

    Raises:
        HTTPException: 404 if dataset not found or not ready.
    """
    logger.info("eda_summary_requested", dataset_id=dataset_id)

    # TODO: Phase 5 - Verify dataset exists and status=ready
    # TODO: Phase 5 - Retrieve EDA summary from cache (Redis) or compute
    # TODO: Phase 5 - If not cached, enqueue Celery task and return 202 Accepted

    mock_columns: List[ColumnStatistics] = []

    mock_response = EDASummaryResponse(
        dataset_id=dataset_id,
        row_count=0,
        column_count=0,
        columns=mock_columns,
        missing_value_percentage=0.0,
        generated_at=datetime.utcnow(),
    )

    return VersionedResponse(data=mock_response)


@router.get(
    "/datasets/{dataset_id}/full",
    response_model=VersionedResponse[EDAReportResponse],
    status_code=status.HTTP_200_OK,
)
async def get_full_eda_report(
    dataset_id: str,
    settings: Settings = Depends(get_app_settings),
) -> VersionedResponse[EDAReportResponse]:
    """
    Get complete EDA report with visualizations.

    Larger response including generated charts and automated insights.
    May take longer to compute than summary endpoint.

    Args:
        dataset_id: Dataset UUID.
        settings: Application settings.

    Returns:
        VersionedResponse containing full EDA report.

    Raises:
        HTTPException: 404 if dataset not found or not ready.
    """
    logger.info("full_eda_requested", dataset_id=dataset_id)

    # TODO: Phase 5 - Check if report exceeds size threshold (store in S3)
    # TODO: Phase 5 - If in S3, return presigned URL instead of inline data
    # TODO: Phase 5 - Compute visualizations via analysis service

    mock_summary = EDASummaryResponse(
        dataset_id=dataset_id,
        row_count=0,
        column_count=0,
        columns=[],
        missing_value_percentage=0.0,
        generated_at=datetime.utcnow(),
    )

    mock_visualizations: List[VisualizationMetadata] = []
    mock_insights: List[str] = []

    mock_response = EDAReportResponse(
        dataset_id=dataset_id,
        summary=mock_summary,
        visualizations=mock_visualizations,
        insights=mock_insights,
        report_id="mock-report-uuid-123",
        generated_at=datetime.utcnow(),
    )

    return VersionedResponse(data=mock_response)
