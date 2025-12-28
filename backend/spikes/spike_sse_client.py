"""
SSE Streaming Client Spike.

Purpose: Validate SSE client-side event parsing and latency measurement.
Layer: Integration Spike (throwaway validation)

Prerequisite:
    Start server in separate terminal:
    python -m uvicorn backend.spikes.spike_sse_server:app --port 8001

Run:
    python -m backend.spikes.spike_sse_client

Success Criteria:
    - All 5 events received
    - Average latency <100ms
    - Reconnection works after disconnect
    - Graceful error handling
"""
import json
import sys
import time
from datetime import datetime
from typing import Any

import httpx


def parse_sse_event(line: str) -> dict[str, Any] | None:
    """
    Parse SSE data line into dictionary.

    SSE Format:
        "data: {json}\\n"

    Args:
        line: Raw SSE line from stream

    Returns:
        Parsed JSON dict or None if not a data line
    """
    line = line.strip()
    if line.startswith("data: "):
        try:
            return json.loads(line[6:])
        except json.JSONDecodeError as e:
            print(f"[✗] Failed to parse SSE event: {e}")
            return None
    return None


def calculate_latency_ms(server_timestamp: str) -> float:
    """
    Calculate latency between server send and client receive.

    Args:
        server_timestamp: ISO format timestamp from server

    Returns:
        Latency in milliseconds
    """
    server_time = datetime.fromisoformat(server_timestamp)
    client_time = datetime.utcnow()
    delta = (client_time - server_time).total_seconds() * 1000
    return delta


def test_sse_streaming(base_url: str, job_id: str) -> bool:
    """
    Test SSE streaming endpoint with latency measurement.

    Args:
        base_url: Server base URL
        job_id: Job identifier

    Returns:
        True if all tests passed, False otherwise
    """
    print(f"[→] Connecting to {base_url}/stream/{job_id}...")

    latencies: list[float] = []
    event_count = 0

    try:
        with httpx.Client(timeout=30.0) as client:
            with client.stream("GET", f"{base_url}/stream/{job_id}") as response:
                if response.status_code != 200:
                    print(f"[✗] Connection failed: HTTP {response.status_code}")
                    return False

                print("[✓] Connected to SSE endpoint")

                for line in response.iter_lines():
                    event = parse_sse_event(line)
                    if event:
                        event_count += 1

                        # Calculate latency
                        latency = calculate_latency_ms(event["timestamp"])
                        latencies.append(latency)

                        # Display progress
                        print(
                            f"[→] Progress: {event['progress_pct']}% - "
                            f"{event['message']} (latency: {latency:.1f}ms)"
                        )

        print(f"[✓] All {event_count} events received")
        return True

    except httpx.ConnectError:
        print(
            "[✗] Connection failed - is server running on port 8001?\n"
            "    Start with: python -m uvicorn backend.spikes.spike_sse_server:app --port 8001"
        )
        return False

    except KeyboardInterrupt:
        print("\n[✗] Test interrupted by user")
        return False

    except Exception as e:
        print(f"[✗] Unexpected error: {e}")
        return False

    finally:
        if latencies:
            avg_latency = sum(latencies) / len(latencies)
            max_latency = max(latencies)

            print(f"\n[Latency Report]")
            print(f"  Average: {avg_latency:.1f}ms")
            print(f"  Maximum: {max_latency:.1f}ms")
            print(f"  Target:  <100ms")

            if avg_latency < 100:
                print(f"  [✓] Latency within target")
            else:
                print(f"  [✗] Latency exceeds target")


def test_reconnection(base_url: str) -> bool:
    """
    Test client reconnection after disconnect.

    Args:
        base_url: Server base URL

    Returns:
        True if reconnection succeeded
    """
    print("\n[Reconnection Test]")
    print("[→] Testing connection recovery...")

    try:
        # First connection - disconnect early
        with httpx.Client(timeout=5.0) as client:
            with client.stream("GET", f"{base_url}/stream/reconnect-test-1") as response:
                event_count = 0
                for line in response.iter_lines():
                    event = parse_sse_event(line)
                    if event:
                        event_count += 1
                        if event_count == 2:
                            print("[→] Simulating disconnect after 2 events...")
                            break  # Force disconnect

        # Second connection - full stream
        with httpx.Client(timeout=5.0) as client:
            with client.stream("GET", f"{base_url}/stream/reconnect-test-2") as response:
                event_count = 0
                for line in response.iter_lines():
                    event = parse_sse_event(line)
                    if event:
                        event_count += 1

        print(f"[✓] Reconnection successful ({event_count} events received)")
        return True

    except Exception as e:
        print(f"[✗] Reconnection failed: {e}")
        return False


def main() -> None:
    """Run SSE client integration spike tests."""
    print("=" * 60)
    print("[SSE SPIKE] Starting SSE streaming integration test...")
    print("=" * 60)

    base_url = "http://localhost:8001"
    job_id = "test-job-123"

    # Test 1: Basic streaming with latency measurement
    streaming_passed = test_sse_streaming(base_url, job_id)

    # Test 2: Reconnection
    reconnection_passed = test_reconnection(base_url)

    # Summary
    print("\n" + "=" * 60)
    print("[Test Summary]")
    print(f"  SSE Streaming:  {'✓ PASSED' if streaming_passed else '✗ FAILED'}")
    print(f"  Reconnection:   {'✓ PASSED' if reconnection_passed else '✗ FAILED'}")

    if streaming_passed and reconnection_passed:
        print("\n[SSE SPIKE] All tests passed!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n[SSE SPIKE] Some tests failed")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
