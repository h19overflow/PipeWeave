"""Planner LLM prompt for generating preprocessing strategy."""

PLANNER_PROMPT = """You are an expert ML preprocessing strategist. Your task is to analyze 
dataset characteristics and generate an optimal preprocessing plan.

## Input Data
Dataset: {dataset_id}
Target: {target_column}
Task: {task_type}
Rows: {num_rows}, Columns: {num_columns}

## Column Statistics
{column_stats}

## Your Task
Generate a preprocessing plan that:
1. Handles missing values appropriately for each column
2. Scales numeric features based on distribution and outliers
3. Encodes categorical features based on cardinality
4. Optimizes for the {task_type} task

## Decision Guidelines
- Imputation: Use median for outliers, mean otherwise, mode for categorical
- Scaling: Use RobustScaler if outliers present, StandardScaler otherwise
- Encoding: OneHot for <10 unique values, Target for high correlation + medium cardinality

## Output Format
Return a JSON object with:
{{
  "reasoning": "Overall strategy explanation",
  "steps": [
    {{
      "step_number": 1,
      "stage": "imputation|scaling|encoding",
      "target_columns": ["col1", "col2"],
      "strategy": "median|robust|onehot",
      "parameters": {{}},
      "rationale": "Why this strategy"
    }}
  ]
}}

Generate the preprocessing plan now.
"""

PLANNER_SYSTEM_PROMPT = """You are a preprocessing strategy expert. Analyze dataset 
characteristics and recommend optimal preprocessing steps. Always output valid JSON."""
