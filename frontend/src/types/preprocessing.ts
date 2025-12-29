/**
 * Preprocessing Page TypeScript Definitions
 * Types for data transformation wizard and pipeline configuration
 */

import type { DataType } from './schema-deduction';

export type WizardStep = 'select' | 'missing' | 'encode' | 'scale' | 'review';

export type MissingStrategyType = 'drop' | 'mean' | 'median' | 'mode' | 'constant' | 'ffill';

export type EncodingStrategyType = 'onehot' | 'label' | 'ordinal' | 'target';

export type ScalingStrategyType = 'standard' | 'minmax' | 'robust' | 'none';

export interface MissingStrategy {
  type: MissingStrategyType;
  value?: string | number;
}

export interface EncodingStrategy {
  type: EncodingStrategyType;
  dropFirst?: boolean;
  order?: string[];
  smoothing?: number;
}

export interface ScalingStrategy {
  type: ScalingStrategyType;
  range?: [number, number];
}

export interface Transform {
  id: string;
  column: string;
  operation: string;
  category: 'missing' | 'encoding' | 'scaling';
  params: Record<string, unknown>;
  order: number;
}

export interface ColumnInfo {
  name: string;
  type: DataType;
  nullCount: number;
  uniqueCount: number;
  sampleValues: (string | number | boolean | null)[];
}

export interface PreprocessingConfig {
  datasetId: string;
  schemaVersion: string;
  isStale: boolean;
  selectedColumns: string[];
  missingValueStrategies: Record<string, MissingStrategy>;
  encodingStrategies: Record<string, EncodingStrategy>;
  scalingStrategies: Record<string, ScalingStrategy>;
  transformQueue: Transform[];
}

export interface PreprocessingPreview {
  originalRows: number;
  transformedRows: number;
  originalColumns: string[];
  newColumns: string[];
  removedColumns: string[];
  sampleBefore: Record<string, unknown>[];
  sampleAfter: Record<string, unknown>[];
}

export interface StepConfig {
  id: WizardStep;
  label: string;
  icon: string;
  description: string;
}

export const WIZARD_STEPS: StepConfig[] = [
  { id: 'select', label: 'Select Columns', icon: 'checklist', description: 'Choose columns to preprocess' },
  { id: 'missing', label: 'Missing Values', icon: 'healing', description: 'Handle null and missing data' },
  { id: 'encode', label: 'Encoding', icon: 'code', description: 'Transform categorical columns' },
  { id: 'scale', label: 'Scaling', icon: 'straighten', description: 'Normalize numeric features' },
  { id: 'review', label: 'Review', icon: 'fact_check', description: 'Confirm and apply changes' },
];

export const MISSING_STRATEGY_OPTIONS: { value: MissingStrategyType; label: string; desc: string }[] = [
  { value: 'drop', label: 'Drop Rows', desc: 'Remove rows with missing values' },
  { value: 'mean', label: 'Mean', desc: 'Fill with column mean' },
  { value: 'median', label: 'Median', desc: 'Fill with column median' },
  { value: 'mode', label: 'Mode', desc: 'Fill with most frequent value' },
  { value: 'constant', label: 'Constant', desc: 'Fill with a specific value' },
  { value: 'ffill', label: 'Forward Fill', desc: 'Propagate last valid value' },
];

export const ENCODING_STRATEGY_OPTIONS: { value: EncodingStrategyType; label: string; desc: string }[] = [
  { value: 'onehot', label: 'One-Hot', desc: 'Create binary columns for each category' },
  { value: 'label', label: 'Label', desc: 'Assign integer to each category' },
  { value: 'ordinal', label: 'Ordinal', desc: 'Custom order mapping' },
  { value: 'target', label: 'Target', desc: 'Encode using target statistics' },
];

export const SCALING_STRATEGY_OPTIONS: { value: ScalingStrategyType; label: string; desc: string }[] = [
  { value: 'standard', label: 'Standard (Z-score)', desc: 'Mean=0, Std=1' },
  { value: 'minmax', label: 'Min-Max', desc: 'Scale to [0, 1] range' },
  { value: 'robust', label: 'Robust', desc: 'Scale using median and IQR' },
  { value: 'none', label: 'None', desc: 'Keep original values' },
];
