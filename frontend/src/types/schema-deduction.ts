/**
 * Schema Deduction Page TypeScript Definitions
 * Types for AI-powered column type inference and user overrides
 */

export type DataType =
  | 'Integer'
  | 'Float'
  | 'String'
  | 'Boolean'
  | 'Datetime'
  | 'Category'
  | 'Text'
  | 'UUID';

export type ConfidenceLevel = 'High' | 'Medium' | 'Review';

export type PipelineStageStatus = 'completed' | 'active' | 'pending';

export interface ColumnDeduction {
  id: string;
  name: string;
  icon: string;
  aiType: DataType;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  manualOverride: DataType | null;
  isLocked: boolean;
  needsReview: boolean;
}

export interface DatasetMetadata {
  sourceFile: string;
  rowCount: number;
  sizeInMb: number;
  lastUpdated: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  icon: string;
  status: PipelineStageStatus;
  statusText: string;
}

export interface AgentLogEntry {
  id: string;
  type: 'active' | 'completed' | 'system';
  title: string;
  message: string;
  timestamp: string;
  sampleData?: string[];
}

export interface ProjectInfo {
  name: string;
  environment: 'Prod' | 'Staging' | 'Dev';
  isOnline: boolean;
}

export interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  isActive?: boolean;
}

export const DATA_TYPE_COLORS: Record<DataType, { bg: string; text: string; border: string }> = {
  Integer: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Float: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  String: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Boolean: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Datetime: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Category: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  Text: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  UUID: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

export const ALL_DATA_TYPES: DataType[] = [
  'Integer', 'Float', 'String', 'Boolean', 'Datetime', 'Category', 'Text', 'UUID'
];
