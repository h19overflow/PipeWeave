"""
ydata-profiling Integration Spike - Validates EDA report generation.

Purpose: Prove ydata-profiling generates EDA reports within performance budget.
Layer: Integration Spike (throwaway validation)

Run: python -m backend.spikes.spike_ydata_profiling
"""
import json
import tempfile
import time
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from ydata_profiling import ProfileReport


def create_test_dataset(rows: int, cols: int, with_nulls: bool = False) -> pd.DataFrame:
    """Create test dataset with mixed types."""
    np.random.seed(42)
    data = {}
    for i in range(cols):
        if i % 3 == 0:
            data[f"numeric_{i}"] = np.random.randn(rows)
        elif i % 3 == 1:
            data[f"category_{i}"] = np.random.choice(["A", "B", "C", "D"], rows)
        else:
            vals = np.random.randn(rows)
            if with_nulls:
                vals[np.random.choice(rows, rows // 10, replace=False)] = np.nan
            data[f"nullable_{i}"] = vals
    return pd.DataFrame(data)


def run_test(
    name: str, df: pd.DataFrame, budget_seconds: int
) -> tuple[bool, float, float]:
    """Run profiling test and return (passed, gen_time, json_size_kb)."""
    start = time.time()
    profile = ProfileReport(df, title=name, minimal=True, explorative=False)
    gen_time = time.time() - start

    json_data = profile.to_json()
    json_size_kb = len(json_data) / 1024

    # Save HTML for inspection
    with tempfile.NamedTemporaryFile(mode="w", suffix=".html", delete=False) as f:
        profile.to_file(Path(f.name))
        html_path = f.name

    # Extract summary from JSON
    report_data = json.loads(json_data)
    table_info = report_data.get("table", {})
    variables = report_data.get("variables", {})

    summary = {
        "rows": table_info.get("n", 0),
        "columns": table_info.get("n_var", 0),
        "missing_pct": round(
            (table_info.get("n_cells_missing", 0) / max(1, table_info.get("n", 1) * table_info.get("n_var", 1)))
            * 100,
            2,
        ),
        "numeric": sum(1 for v in variables.values() if v.get("type") in ["Numeric", "Unsupported"]),
        "categorical": sum(1 for v in variables.values() if v.get("type") == "Categorical"),
    }

    # Print results
    print(f"\n=== {name} ===")
    print(f"[✓] ProfileReport generated in {gen_time:.1f}s")
    if json_size_kb > 1024:
        print(f"[✓] JSON size: {json_size_kb / 1024:.1f} MB (exceeds 1MB → S3 storage)")
    else:
        print(f"[✓] JSON size: {json_size_kb:.1f} KB")
    print(f"[✓] HTML saved to: {html_path}")
    print(f"[✓] Summary: {summary['rows']} rows, {summary['columns']} cols, "
          f"{summary['missing_pct']}% missing, {summary['numeric']} numeric, "
          f"{summary['categorical']} categorical")

    passed = gen_time < budget_seconds
    status = "✓" if passed else "✗"
    print(f"{status} Time: {gen_time:.1f}s (budget: <{budget_seconds}s)")

    return passed, gen_time, json_size_kb


def main() -> None:
    """Run ydata-profiling integration spike tests."""
    print("[YDATA SPIKE] Starting ydata-profiling integration test...")

    results = []

    # Test 1: Small dataset (150 rows, 5 columns)
    df_small = create_test_dataset(rows=150, cols=5, with_nulls=False)
    passed, gen_time, json_kb = run_test("Small Dataset (150 rows x 5 cols)", df_small, budget_seconds=30)
    results.append(("Small (150 rows)", gen_time, 30, passed))

    # Test 2: Medium dataset (1000 rows, 10 columns)
    df_medium = create_test_dataset(rows=1000, cols=10, with_nulls=True)
    passed, gen_time, json_kb = run_test("Medium Dataset (1000 rows x 10 cols)", df_medium, budget_seconds=60)
    results.append(("Medium (1000 rows)", gen_time, 60, passed))

    # Performance Summary
    print("\n=== Performance Summary ===")
    all_passed = all(p for _, _, _, p in results)
    for name, elapsed, budget, passed in results:
        status = "✓" if passed else "✗"
        print(f"{name}: {elapsed:.1f}s {status} (budget: <{budget}s)")

    print()
    if all_passed:
        print("[YDATA SPIKE] All tests passed!")
    else:
        print("[YDATA SPIKE] Performance budget exceeded!")


if __name__ == "__main__":
    main()
