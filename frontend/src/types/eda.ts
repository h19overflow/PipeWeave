/**
 * EDA (Exploratory Data Analysis) Page TypeScript Definitions
 * Types for data profiling, quality metrics, and statistical analysis
 */

export type ColumnDType = 'numeric' | 'categorical' | 'datetime' | 'text';
export type QualityStatus = 'healthy' | 'warning' | 'critical';

export interface NumericStats {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q25: number;
  q75: number;
  skewness: number;
  kurtosis: number;
}

export interface CategoricalStats {
  uniqueCount: number;
  topValues: { value: string; count: number }[];
  mode: string;
  entropy: number;
}

export interface DistributionBin {
  bin: string;
  count: number;
}

export interface ColumnAnalysis {
  name: string;
  dtype: ColumnDType;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  qualityStatus: QualityStatus;
  stats?: NumericStats | CategoricalStats;
  distribution: DistributionBin[];
  sampleValues: string[];
  recommendation?: string;
}

export interface CorrelationEntry {
  col1: string;
  col2: string;
  value: number;
}

export interface MissingMatrixEntry {
  column: string;
  missingIndices: number[];
}

export interface EDASummary {
  rowCount: number;
  columnCount: number;
  numericColumns: number;
  categoricalColumns: number;
  nullPercentage: number;
  duplicatePercentage: number;
  memorySizeMB: number;
  qualityScore: number;
}

export interface EDAReport {
  datasetId: string;
  datasetName: string;
  generatedAt: Date;
  isStale: boolean;
  summary: EDASummary;
  columns: ColumnAnalysis[];
  correlations: CorrelationEntry[];
  missingMatrix: MissingMatrixEntry[];
}

/** Thresholds for quality status determination */
export const QUALITY_THRESHOLDS = {
  nullWarning: 5,
  nullCritical: 20,
  uniqueRatioWarning: 0.95,
  uniqueRatioCritical: 0.99,
} as const;

/** Color configurations for quality status */
export const QUALITY_STATUS_COLORS: Record<QualityStatus, { bg: string; text: string; border: string }> = {
  healthy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

/** Color configurations for data types */
export const DTYPE_COLORS: Record<ColumnDType, { bg: string; text: string; border: string }> = {
  numeric: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  categorical: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  datetime: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  text: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
};
