// Pipeline Editor Type Definitions

export type NodeStatus = 'success' | 'warning' | 'pending' | 'error';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodePort {
  id: string;
  type: 'input' | 'output';
  position: 'left' | 'right' | 'top' | 'bottom';
}

export interface PipelineNodeData {
  id: string;
  type: 'data-input' | 'transformer' | 'encoder' | 'model';
  title: string;
  icon: string;
  iconColor: string;
  status: NodeStatus;
  position: NodePosition;
  isActive?: boolean;
  config: Record<string, string | number | boolean>;
  metadata?: Record<string, string | number>;
}

export interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  isActive: boolean;
}

export interface EncoderOption {
  id: string;
  name: string;
  isRecommended?: boolean;
}

export interface MetricData {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
}

export interface CopilotMessage {
  id: string;
  type: 'analysis' | 'recommendation' | 'system';
  content: string;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DataPreviewRow {
  [key: string]: string | number;
}

export interface DataPreviewConfig {
  fileName: string;
  rowCount: number;
  columns: string[];
  data: DataPreviewRow[];
}

// Animation timing constants
export const ANIMATION_CONFIG = {
  node: {
    entranceDelay: 0.1,
    entranceDuration: 0.6,
    dragSpring: { stiffness: 300, damping: 30 },
    hoverScale: 1.02,
    glowPulseDuration: 2,
  },
  path: {
    dashAnimationDuration: 30,
    drawDuration: 0.8,
    recalculateDuration: 0.4,
  },
  panel: {
    slideUpDuration: 0.5,
    rowStaggerDelay: 0.05,
  },
  dropdown: {
    openDuration: 0.2,
    itemHoverDuration: 0.15,
  },
  metrics: {
    countUpDuration: 1.5,
    deltaBounceDuration: 0.3,
  },
  copilot: {
    messageSlideInDuration: 0.4,
    typewriterSpeed: 30,
  },
} as const;

// Theme colors for pipeline editor
export const PIPELINE_THEME = {
  primary: '#3713ec',
  primaryLight: '#6d52f4',
  backgroundDark: '#131022',
  surfaceDark: '#1e1b2e',
  borderDark: '#292348',
  textSecondary: '#9b92c9',
  canvasBackground: '#0f0c1d',
  nodeStatusColors: {
    success: '#22c55e',
    warning: '#facc15',
    pending: '#9b92c9',
    error: '#ef4444',
  },
} as const;
