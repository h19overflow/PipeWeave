/**
 * Mock EDA Report Data for development and testing
 * Simulates backend ydata-profiling output structure
 */

import type { EDAReport, ColumnAnalysis, CorrelationEntry, MissingMatrixEntry } from '@/types/eda';

const MOCK_COLUMNS: ColumnAnalysis[] = [
  {
    name: 'customer_id',
    dtype: 'categorical',
    nullCount: 0,
    nullPercentage: 0,
    uniqueCount: 10000,
    qualityStatus: 'healthy',
    stats: { uniqueCount: 10000, topValues: [{ value: 'C001', count: 1 }], mode: 'C001', entropy: 9.21 },
    distribution: Array.from({ length: 10 }, (_, i) => ({ bin: `Bin ${i + 1}`, count: 1000 })),
    sampleValues: ['C001', 'C002', 'C003', 'C004', 'C005'],
  },
  {
    name: 'age',
    dtype: 'numeric',
    nullCount: 45,
    nullPercentage: 0.45,
    uniqueCount: 73,
    qualityStatus: 'healthy',
    stats: { mean: 42.5, median: 41, std: 12.3, min: 18, max: 85, q25: 32, q75: 52, skewness: 0.23, kurtosis: -0.45 },
    distribution: [
      { bin: '18-25', count: 1200 }, { bin: '26-35', count: 2800 }, { bin: '36-45', count: 2500 },
      { bin: '46-55', count: 1800 }, { bin: '56-65', count: 1100 }, { bin: '66+', count: 600 },
    ],
    sampleValues: ['35', '42', '28', '56', '63'],
    recommendation: 'Distribution appears normal. No transformation needed.',
  },
  {
    name: 'income',
    dtype: 'numeric',
    nullCount: 234,
    nullPercentage: 2.34,
    uniqueCount: 8450,
    qualityStatus: 'healthy',
    stats: { mean: 65000, median: 58000, std: 28000, min: 15000, max: 250000, q25: 42000, q75: 82000, skewness: 1.45, kurtosis: 2.1 },
    distribution: [
      { bin: '15k-30k', count: 1500 }, { bin: '30k-50k', count: 2800 }, { bin: '50k-70k', count: 2200 },
      { bin: '70k-100k', count: 1800 }, { bin: '100k-150k', count: 1100 }, { bin: '150k+', count: 600 },
    ],
    sampleValues: ['45000', '72000', '58000', '125000', '38000'],
    recommendation: 'Right-skewed distribution detected. Consider log transformation for ML models.',
  },
  {
    name: 'account_type',
    dtype: 'categorical',
    nullCount: 0,
    nullPercentage: 0,
    uniqueCount: 4,
    qualityStatus: 'healthy',
    stats: { uniqueCount: 4, topValues: [{ value: 'Premium', count: 4200 }, { value: 'Basic', count: 3500 }], mode: 'Premium', entropy: 1.38 },
    distribution: [
      { bin: 'Premium', count: 4200 }, { bin: 'Basic', count: 3500 }, { bin: 'Gold', count: 1800 }, { bin: 'Platinum', count: 500 },
    ],
    sampleValues: ['Premium', 'Basic', 'Gold', 'Platinum', 'Basic'],
  },
  {
    name: 'tenure_months',
    dtype: 'numeric',
    nullCount: 0,
    nullPercentage: 0,
    uniqueCount: 72,
    qualityStatus: 'healthy',
    stats: { mean: 32, median: 28, std: 18, min: 1, max: 72, q25: 16, q75: 48, skewness: 0.35, kurtosis: -0.8 },
    distribution: [
      { bin: '0-12', count: 2200 }, { bin: '12-24', count: 2000 }, { bin: '24-36', count: 1800 },
      { bin: '36-48', count: 1600 }, { bin: '48-60', count: 1400 }, { bin: '60+', count: 1000 },
    ],
    sampleValues: ['24', '36', '12', '48', '60'],
  },
  {
    name: 'last_purchase_date',
    dtype: 'datetime',
    nullCount: 1850,
    nullPercentage: 18.5,
    uniqueCount: 365,
    qualityStatus: 'warning',
    distribution: Array.from({ length: 12 }, (_, i) => ({ bin: `Month ${i + 1}`, count: Math.floor(Math.random() * 1000) + 500 })),
    sampleValues: ['2024-01-15', '2024-03-22', '2024-06-08', '2024-09-14', '2024-11-30'],
    recommendation: 'High null rate (18.5%). Consider imputation or flagging missing values.',
  },
  {
    name: 'churn_flag',
    dtype: 'categorical',
    nullCount: 0,
    nullPercentage: 0,
    uniqueCount: 2,
    qualityStatus: 'healthy',
    stats: { uniqueCount: 2, topValues: [{ value: 'No', count: 7300 }, { value: 'Yes', count: 2700 }], mode: 'No', entropy: 0.88 },
    distribution: [{ bin: 'No', count: 7300 }, { bin: 'Yes', count: 2700 }],
    sampleValues: ['No', 'No', 'Yes', 'No', 'Yes'],
    recommendation: 'Imbalanced target variable (27% churn). Consider SMOTE or class weights.',
  },
  {
    name: 'support_tickets',
    dtype: 'numeric',
    nullCount: 0,
    nullPercentage: 0,
    uniqueCount: 15,
    qualityStatus: 'healthy',
    stats: { mean: 2.3, median: 2, std: 2.1, min: 0, max: 12, q25: 1, q75: 3, skewness: 1.8, kurtosis: 3.5 },
    distribution: [
      { bin: '0', count: 2500 }, { bin: '1', count: 2200 }, { bin: '2', count: 1800 },
      { bin: '3', count: 1400 }, { bin: '4', count: 1000 }, { bin: '5+', count: 1100 },
    ],
    sampleValues: ['0', '2', '1', '5', '3'],
  },
];

const MOCK_CORRELATIONS: CorrelationEntry[] = [
  { col1: 'age', col2: 'income', value: 0.42 },
  { col1: 'age', col2: 'tenure_months', value: 0.68 },
  { col1: 'age', col2: 'support_tickets', value: -0.15 },
  { col1: 'income', col2: 'tenure_months', value: 0.35 },
  { col1: 'income', col2: 'support_tickets', value: -0.22 },
  { col1: 'tenure_months', col2: 'support_tickets', value: -0.31 },
];

const MOCK_MISSING_MATRIX: MissingMatrixEntry[] = MOCK_COLUMNS.map((col) => ({
  column: col.name,
  missingIndices: Array.from({ length: col.nullCount }, () => Math.floor(Math.random() * 10000)),
}));

export const MOCK_EDA_REPORT: EDAReport = {
  datasetId: 'ds-001',
  datasetName: 'customer_churn_analysis.csv',
  generatedAt: new Date('2024-12-28T14:30:00'),
  isStale: true,
  summary: {
    rowCount: 10000,
    columnCount: 8,
    numericColumns: 4,
    categoricalColumns: 4,
    nullPercentage: 2.8,
    duplicatePercentage: 0.3,
    memorySizeMB: 4.2,
    qualityScore: 78,
  },
  columns: MOCK_COLUMNS,
  correlations: MOCK_CORRELATIONS,
  missingMatrix: MOCK_MISSING_MATRIX,
};
