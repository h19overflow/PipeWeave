/**
 * Mock data for PreprocessingPage
 * Simulates dataset columns and transformation preview
 */

import type { ColumnInfo, PreprocessingConfig, PreprocessingPreview } from '@/types/preprocessing';

export const MOCK_COLUMNS: ColumnInfo[] = [
  { name: 'user_id', type: 'Integer', nullCount: 0, uniqueCount: 45201, sampleValues: [1001, 1002, 1003, 1004, 1005] },
  { name: 'age', type: 'Integer', nullCount: 234, uniqueCount: 72, sampleValues: [25, 34, 45, 28, 52] },
  { name: 'income', type: 'Float', nullCount: 1502, uniqueCount: 8934, sampleValues: [45000.50, 72000.00, 38500.25, 95000.00, 62000.75] },
  { name: 'customer_segment', type: 'Category', nullCount: 45, uniqueCount: 5, sampleValues: ['Premium', 'Standard', 'Basic', 'Enterprise', 'Starter'] },
  { name: 'signup_source', type: 'Category', nullCount: 0, uniqueCount: 12, sampleValues: ['Google', 'Facebook', 'Direct', 'Referral', 'LinkedIn'] },
  { name: 'churn_risk', type: 'Float', nullCount: 890, uniqueCount: 100, sampleValues: [0.15, 0.78, 0.32, 0.92, 0.45] },
  { name: 'lifetime_value', type: 'Float', nullCount: 0, uniqueCount: 12450, sampleValues: [1250.00, 3400.50, 890.25, 5600.00, 2100.75] },
  { name: 'last_purchase', type: 'Datetime', nullCount: 567, uniqueCount: 890, sampleValues: ['2024-01-15', '2024-02-20', '2024-03-05', '2024-01-28', '2024-02-14'] },
  { name: 'email_domain', type: 'String', nullCount: 12, uniqueCount: 3456, sampleValues: ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'hotmail.com'] },
  { name: 'is_verified', type: 'Boolean', nullCount: 0, uniqueCount: 2, sampleValues: [true, false, true, true, false] },
  { name: 'product_rating', type: 'Float', nullCount: 2340, uniqueCount: 50, sampleValues: [4.5, 3.2, 5.0, 4.8, 2.9] },
  { name: 'support_tickets', type: 'Integer', nullCount: 0, uniqueCount: 45, sampleValues: [0, 2, 5, 1, 8] },
];

export const MOCK_PREVIEW: PreprocessingPreview = {
  originalRows: 45201,
  transformedRows: 42890,
  originalColumns: MOCK_COLUMNS.map(c => c.name),
  newColumns: ['customer_segment_Premium', 'customer_segment_Standard', 'customer_segment_Basic', 'signup_source_encoded'],
  removedColumns: ['email_domain'],
  sampleBefore: [
    { user_id: 1001, age: 25, income: 45000.50, customer_segment: 'Premium', signup_source: 'Google', churn_risk: 0.15, lifetime_value: 1250.00, last_purchase: '2024-01-15', email_domain: 'gmail.com', is_verified: true, product_rating: 4.5, support_tickets: 0 },
    { user_id: 1002, age: null, income: 72000.00, customer_segment: 'Standard', signup_source: 'Facebook', churn_risk: 0.78, lifetime_value: 3400.50, last_purchase: '2024-02-20', email_domain: 'yahoo.com', is_verified: false, product_rating: 3.2, support_tickets: 2 },
    { user_id: 1003, age: 45, income: null, customer_segment: 'Basic', signup_source: 'Direct', churn_risk: null, lifetime_value: 890.25, last_purchase: null, email_domain: 'outlook.com', is_verified: true, product_rating: 5.0, support_tickets: 5 },
    { user_id: 1004, age: 28, income: 95000.00, customer_segment: null, signup_source: 'Referral', churn_risk: 0.92, lifetime_value: 5600.00, last_purchase: '2024-01-28', email_domain: 'company.com', is_verified: true, product_rating: null, support_tickets: 1 },
    { user_id: 1005, age: 52, income: 62000.75, customer_segment: 'Enterprise', signup_source: 'LinkedIn', churn_risk: 0.45, lifetime_value: 2100.75, last_purchase: '2024-02-14', email_domain: 'hotmail.com', is_verified: false, product_rating: 2.9, support_tickets: 8 },
  ],
  sampleAfter: [
    { user_id: 1001, age: 25, income: 0.12, customer_segment_Premium: 1, customer_segment_Standard: 0, customer_segment_Basic: 0, signup_source_encoded: 0, churn_risk: 0.15, lifetime_value: 0.08, is_verified: true, product_rating: 4.5, support_tickets: 0 },
    { user_id: 1002, age: 37, income: 0.48, customer_segment_Premium: 0, customer_segment_Standard: 1, customer_segment_Basic: 0, signup_source_encoded: 1, churn_risk: 0.78, lifetime_value: 0.45, is_verified: false, product_rating: 3.2, support_tickets: 2 },
    { user_id: 1003, age: 45, income: 0.35, customer_segment_Premium: 0, customer_segment_Standard: 0, customer_segment_Basic: 1, signup_source_encoded: 2, churn_risk: 0.50, lifetime_value: 0.02, is_verified: true, product_rating: 5.0, support_tickets: 5 },
    { user_id: 1004, age: 28, income: 0.82, customer_segment_Premium: 0, customer_segment_Standard: 0, customer_segment_Basic: 0, signup_source_encoded: 3, churn_risk: 0.92, lifetime_value: 0.89, is_verified: true, product_rating: 4.0, support_tickets: 1 },
    { user_id: 1005, age: 52, income: 0.55, customer_segment_Premium: 0, customer_segment_Standard: 0, customer_segment_Basic: 0, signup_source_encoded: 4, churn_risk: 0.45, lifetime_value: 0.25, is_verified: false, product_rating: 2.9, support_tickets: 8 },
  ],
};

export function createInitialConfig(): PreprocessingConfig {
  return {
    datasetId: 'ds-001',
    schemaVersion: 'v1.2',
    isStale: false,
    selectedColumns: MOCK_COLUMNS.map(c => c.name),
    missingValueStrategies: {},
    encodingStrategies: {},
    scalingStrategies: {},
    transformQueue: [],
  };
}
