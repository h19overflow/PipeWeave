/**
 * Type definitions for Models Page
 * Defines model metadata, metrics, and filtering types
 */

export type MLModelType = 'classification' | 'regression';
export type MLModelStatus = 'training' | 'ready' | 'failed';
export type MLModelSortBy = 'newest' | 'best-performance' | 'name';

export interface ClassificationMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
}

export interface RegressionMetrics {
  rmse?: number;
  mae?: number;
  r2?: number;
}

export type MLModelMetrics = ClassificationMetrics | RegressionMetrics;

export interface MLModel {
  id: string;
  name: string;
  type: MLModelType;
  algorithm: string;
  metrics: MLModelMetrics;
  trainedAt: Date;
  datasetName: string;
  status: MLModelStatus;
}

export interface MLModelFilters {
  type: MLModelType | 'all';
  status: MLModelStatus | 'all';
  sortBy: MLModelSortBy;
  searchQuery: string;
}
