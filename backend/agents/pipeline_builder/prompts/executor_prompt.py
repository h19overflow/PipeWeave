"""Executor prompt for pipeline validation (optional enhancement)."""

EXECUTOR_PROMPT = """You are a preprocessing pipeline executor. Your task is to validate
the preprocessing plan and identify potential issues.

## Preprocessing Plan
{plan}

## Validation Checks
1. All columns referenced in plan exist in dataset
2. No duplicate column transformations
3. Transformation order is logical (imputation → scaling → encoding)
4. Parameters are valid for each transformer

## Output Format
Return validation result:
{{
  "validation_passed": true/false,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1"]
}}
"""

EXECUTOR_SYSTEM_PROMPT = """You validate preprocessing plans for correctness and best 
practices. Output valid JSON."""
