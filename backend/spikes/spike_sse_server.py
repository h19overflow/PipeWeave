"""
SSE Streaming Server Spike.

Purpose: Validate Server-Sent Events streaming with FastAPI.
Layer: Integration Spike (throwaway validation)

Run:
    python -m uvicorn backend.spikes.spike_sse_server:app --port 8001

Test with:
    python -m backend.spikes.spike_sse_client

Expected behavior:
    - Streams 5 progress updates (0% → 100%)
    - JSON-formatted SSE events
    - Graceful disconnect handling
    - <100ms latency per event
"""
import asyncio
import json
from datetime import datetime
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse


app = FastAPI(title="SSE Spike Server")


async def progress_generator(
    job_id: str,
    request: Request,
) -> AsyncGenerator[str, None]:
    """
    Generate SSE events with progress updates.

    Simulates a long-running ML training job with progress tracking.

    Args:
        job_id: Unique job identifier
        request: FastAPI request object for disconnect detection

    Yields:
        SSE-formatted strings with progress data

    Event Format:
        data: {"job_id": "...", "progress_pct": 50, "message": "...", "timestamp": "..."}
    """
    steps = [
        (0, "Starting task..."),
        (25, "Processing step 1..."),
        (50, "Processing step 2..."),
        (75, "Processing step 3..."),
        (100, "Task completed!"),
    ]

    for progress, message in steps:
        # Check if client disconnected
        if await request.is_disconnected():
            print(f"[SSE Server] Client disconnected for job {job_id}")
            break

        data = {
            "job_id": job_id,
            "progress_pct": progress,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # SSE format: "data: {json}\n\n"
        yield f"data: {json.dumps(data)}\n\n"

        # Simulate work (except after final event)
        if progress < 100:
            await asyncio.sleep(1)


@app.get("/stream/{job_id}")
async def stream_progress(
    job_id: str,
    request: Request,
) -> StreamingResponse:
    """
    Stream job progress via Server-Sent Events.

    SSE Protocol:
        - Media type: text/event-stream
        - Format: "data: {json}\\n\\n"
        - Keep-alive: Connection maintained until complete or disconnect

    Args:
        job_id: Unique job identifier
        request: FastAPI request for disconnect detection

    Returns:
        StreamingResponse with SSE events

    Example Event:
        data: {"job_id": "test-123", "progress_pct": 50, "message": "Processing...", "timestamp": "2025-12-28T..."}
    """
    print(f"[SSE Server] Client connected for job: {job_id}")

    return StreamingResponse(
        progress_generator(job_id, request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@app.get("/health")
async def health() -> dict[str, str]:
    """
    Health check endpoint.

    Returns:
        Status dictionary
    """
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint with usage instructions.

    Returns:
        Usage instructions
    """
    return {
        "service": "SSE Spike Server",
        "endpoints": {
            "/stream/{job_id}": "Stream progress via SSE",
            "/health": "Health check",
        },
        "test_command": "python -m backend.spikes.spike_sse_client",
    }
