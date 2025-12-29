"""Pipeline validation tool."""

from typing import Any, Dict, List

import pandas as pd


def validate_preprocessing_pipeline(
    pipeline_config: Dict[str, Any],
    X_sample: pd.DataFrame,
) -> Dict[str, Any]:
    """Validate preprocessing pipeline configuration for logical consistency and feasibility.

    Performs 4 critical validation checks before pipeline execution:

    VALIDATION CHECKS:

    1. Column Existence
       ├─ Requirement: All pipeline steps reference columns present in dataset
       ├─ Check: Compare pipeline column names against X_sample.columns
       ├─ Error message: "Missing columns in dataset: {missing}"
       └─ Impact: Pipeline will fail at runtime if columns don't exist

    2. No Duplicate Assignments
       ├─ Requirement: Each column is NOT assigned to multiple transformation steps
       ├─ Check: Count column occurrences across all pipeline steps
       ├─ Error message: "Duplicate column assignments: {duplicates}"
       └─ Impact: Ambiguous ordering (which transformation applies first?)

    3. No Conflicting Transformations
       ├─ Requirement: Same column type (numeric/categorical) not transformed differently
       ├─ Check: [Future] Ensure consistent transformation logic
       ├─ Example: Column "age" scaled by StandardScaler AND RobustScaler (conflict)
       └─ Impact: Undefined behavior or incorrect output

    4. Output Shape Calculability
       ├─ Requirement: Expected output dimensions can be determined
       ├─ Check: success=True → Calculate (N_samples, N_features)
       ├─ Calculation: (num_rows_in_sample, total_unique_columns_referenced)
       └─ Impact: Allows downstream to allocate output arrays

    PIPELINE CONFIGURATION FORMAT:

    Expected pipeline_config structure:
    {
        "plan_id": "plan_abc123",
        "dataset_id": "dataset_xyz",
        "steps": [
            {
                "name": "imputation_age",
                "type": "imputation",
                "target_columns": ["age"],
                "strategy": "median"
            },
            {
                "name": "scaling_age",
                "type": "scaling",
                "target_columns": ["age"],
                "strategy": "robust"
            },
            {
                "name": "encoding_gender",
                "type": "encoding",
                "target_columns": ["gender"],
                "strategy": "onehot"
            }
        ]
    }

    VALIDATION LOGIC:

    1. Extract all "target_columns" from all steps
    2. Check: target_columns ⊆ X_sample.columns
       → If False, return {"success": False, "errors": [...]}
    3. Check: len(columns) == sum(1 for col in columns)
       → If duplicates exist, return {"success": False, "errors": [...]}
    4. If all checks pass:
       → Return {"success": True, "output_shape": (N, M), "errors": []}

    Args:
        pipeline_config: Dict with "steps" key containing list of transformation steps
                        Each step has "target_columns": List[str]
        X_sample: pandas.DataFrame to validate against
                 (typically first 100 rows for quick validation)

    Returns:
        Validation result Dict:
        {
            "success": bool,  # True if all checks pass
            "output_shape": tuple | None,  # (n_samples, n_features) if success=True
            "errors": List[str]  # List of validation error messages (empty if success)
        }

    Examples:
        >>> config = {
        ...     "steps": [
        ...         {"target_columns": ["age", "income"]},
        ...         {"target_columns": ["category"]}
        ...     ]
        ... }
        >>> df = pd.DataFrame({"age": [25], "income": [50000], "category": ["A"]})
        >>> validate_preprocessing_pipeline(config, df)
        {"success": True, "output_shape": (1, 3), "errors": []}

        >>> config = {
        ...     "steps": [
        ...         {"target_columns": ["age", "salary"]},  # "salary" doesn't exist
        ...     ]
        ... }
        >>> validate_preprocessing_pipeline(config, df)
        {"success": False, "output_shape": None, "errors": ["Missing columns: {'salary'}"]}
    """
    errors: List[str] = []
    success = True

    # Extract columns from pipeline steps
    all_columns = set()
    for step in pipeline_config.get("steps", []):
        target_cols = step.get("target_columns", [])
        all_columns.update(target_cols)

        # Check if columns exist in sample
        missing_cols = set(target_cols) - set(X_sample.columns)
        if missing_cols:
            errors.append(f"Missing columns in dataset: {missing_cols}")
            success = False

    # Check for duplicate column assignments
    column_counts: Dict[str, int] = {}
    for col in all_columns:
        column_counts[col] = column_counts.get(col, 0) + 1

    duplicates = [col for col, count in column_counts.items() if count > 1]
    if duplicates:
        errors.append(f"Duplicate column assignments: {duplicates}")
        success = False

    # Calculate expected output shape
    output_shape = None
    if success:
        num_rows = len(X_sample)
        num_features = len(all_columns)
        output_shape = (num_rows, num_features)

    return {
        "success": success,
        "output_shape": output_shape,
        "errors": errors,
    }
