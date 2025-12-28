"""
Abstract Base Class for Evaluation Report Builders.

Defines interface for evaluation report generation.
Enables extensibility: classification, regression, model comparison, production reports.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseEvaluationReportBuilder(ABC):
    """
    Abstract base for evaluation report generation.

    Subclasses implement domain-specific report formats:
    - ClassificationReportBuilder (confusion matrix, ROC curves, precision-recall)
    - RegressionReportBuilder (residual plots, prediction vs actual, error distribution)
    - ModelComparisonReportBuilder (compare multiple models side-by-side)
    - ProductionReportBuilder (model cards, bias analysis, fairness metrics)

    All builders must:
    - Accept evaluation metrics + feature analysis
    - Generate structured report data
    - Support multiple output formats (JSON, HTML, PDF)
    - Include visualization-ready data
    """

    @abstractmethod
    def build_report(
        self,
        evaluation_metrics: Dict[str, Any],
        feature_analysis: List[Dict[str, Any]],
        model_metadata: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Build comprehensive evaluation report from analysis results.

        Args:
            evaluation_metrics: Output from BaseModelEvaluator.evaluate()
            feature_analysis: Output from BaseFeatureAnalyzer.analyze()
            model_metadata: Model info (algorithm, hyperparameters, training time, etc.)

        Returns:
            Dictionary containing:
                - summary: High-level summary (overall accuracy, R2, etc.)
                - detailed_metrics: Full metric breakdown
                - feature_importance: Ranked features with scores
                - visualizations: Data for charts (confusion matrix, feature plots, etc.)
                - recommendations: Actionable insights (e.g., "Remove low-importance features")
                - metadata: Report generation info (timestamp, version, etc.)

        Raises:
            ValueError: If required keys missing from input dictionaries

        Example:
            >>> builder = ClassificationReportBuilder()
            >>> report = builder.build_report(metrics, features, metadata)
            >>> print(f"Accuracy: {report['summary']['accuracy']}")
        """
        pass

    @abstractmethod
    def export_to_json(
        self,
        report: Dict[str, Any],
    ) -> str:
        """
        Export report to JSON string for storage.

        Args:
            report: Report dictionary from build_report()

        Returns:
            JSON string representation of report

        Raises:
            ValueError: If report structure invalid

        Example:
            >>> json_str = builder.export_to_json(report)
            >>> with open("report.json", "w") as f:
            >>>     f.write(json_str)
        """
        pass

    @abstractmethod
    def export_to_html(
        self,
        report: Dict[str, Any],
        template: Optional[str] = None,
    ) -> str:
        """
        Export report to interactive HTML for visualization.

        Args:
            report: Report dictionary from build_report()
            template: Optional HTML template path (uses default if None)

        Returns:
            HTML string with embedded visualizations

        Raises:
            ValueError: If report structure invalid or template not found

        Example:
            >>> html_str = builder.export_to_html(report)
            >>> with open("report.html", "w") as f:
            >>>     f.write(html_str)
        """
        pass
