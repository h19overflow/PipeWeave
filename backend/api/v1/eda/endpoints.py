"""
EDA (Exploratory Data Analysis) API endpoints (v1).

Provides summary statistics and full EDA reports for datasets.

Layer: 2 (API)
Dependencies: fastapi, backend.api.schemas
"""

from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import get_current_user_id, get_eda_service
from backend.api.schemas import (
    EDAJobResponse,
    EDAReportResponse,
    EDAStatusResponse,
    EDASummaryResponse,
    VersionedResponse,
)
from backend.boundary.crud.eda_report import eda_report_crud
from backend.services.eda.eda_service import EDAService

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/eda", tags=["EDA"])


@router.post(
    "/datasets/{dataset_id}/queue",
    response_model=VersionedResponse[EDAJobResponse],
    status_code=status.HTTP_202_ACCEPTED,
)
async def queue_eda_generation(
    dataset_id: str,
    service: EDAService = Depends(get_eda_service),
    user_id: UUID = Depends(get_current_user_id),
) -> VersionedResponse[EDAJobResponse]:
    """Queue EDA report generation for dataset."""
    logger.info("eda_generation_queued", dataset_id=dataset_id, user_id=str(user_id))

    try:
        dataset_uuid = UUID(dataset_id)
        result = await service.queue_eda_generation(dataset_uuid, user_id)

        response = EDAJobResponse(
            report_id=str(result.report_id),
            job_id=result.job_id,
            status=result.status,
        )
        return VersionedResponse(data=response)

    except ValueError as e:
        logger.error("eda_queue_failed", error=str(e), dataset_id=dataset_id)
        if "not found" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/reports/{report_id}/status",
    response_model=VersionedResponse[EDAStatusResponse],
    status_code=status.HTTP_200_OK,
)
async def get_eda_status(
    report_id: str,
    service: EDAService = Depends(get_eda_service),
) -> VersionedResponse[EDAStatusResponse]:
    """Get EDA job status and progress."""
    logger.info("eda_status_requested", report_id=report_id)

    try:
        report_uuid = UUID(report_id)
        status_info = await service.get_eda_status(report_uuid)

        response = EDAStatusResponse(
            status=status_info["status"],
            progress_pct=status_info.get("progress_pct", 0),
            step=status_info.get("step"),
            error=status_info.get("error"),
        )
        return VersionedResponse(data=response)

    except ValueError as e:
        logger.error("eda_status_failed", error=str(e), report_id=report_id)
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/datasets/{dataset_id}/summary",
    response_model=VersionedResponse[EDASummaryResponse],
    status_code=status.HTTP_200_OK,
)
async def get_eda_summary(
    dataset_id: str,
    service: EDAService = Depends(get_eda_service),
) -> VersionedResponse[EDASummaryResponse]:
    """Get quick EDA summary for dataset."""
    logger.info("eda_summary_requested", dataset_id=dataset_id)

    try:
        dataset_uuid = UUID(dataset_id)
        report = await eda_report_crud.get_latest(service._db, dataset_id=dataset_uuid)

        if report is None:
            raise HTTPException(
                status_code=404,
                detail="No EDA report found. Queue generation first.",
            )

        full_report = await service.get_full_report(report.id)
        if full_report is None or "summary" not in full_report:
            raise HTTPException(status_code=404, detail="EDA data not available")

        summary = EDASummaryResponse(**full_report["summary"])
        return VersionedResponse(data=summary)

    except ValueError as e:
        logger.error("eda_summary_failed", error=str(e), dataset_id=dataset_id)
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/datasets/{dataset_id}/full",
    response_model=VersionedResponse[EDAReportResponse],
    status_code=status.HTTP_200_OK,
)
async def get_full_eda_report(
    dataset_id: str,
    service: EDAService = Depends(get_eda_service),
) -> VersionedResponse[EDAReportResponse]:
    """Get complete EDA report with visualizations."""
    logger.info("full_eda_requested", dataset_id=dataset_id)

    try:
        dataset_uuid = UUID(dataset_id)
        report = await eda_report_crud.get_latest(service._db, dataset_id=dataset_uuid)

        if report is None:
            raise HTTPException(
                status_code=404,
                detail="No EDA report found. Queue generation first.",
            )

        full_report = await service.get_full_report(report.id)
        if full_report is None:
            raise HTTPException(status_code=404, detail="EDA data not available")

        response = EDAReportResponse(**full_report)
        return VersionedResponse(data=response)

    except ValueError as e:
        logger.error("full_eda_failed", error=str(e), dataset_id=dataset_id)
        raise HTTPException(status_code=404, detail=str(e))
