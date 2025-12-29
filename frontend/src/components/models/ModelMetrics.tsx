/**
 * ModelMetrics - Displays model performance metrics with visualizations
 * Shows relevant metrics based on model type (classification vs regression)
 */

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import type { MLModelType, MLModelMetrics as MLModelMetricsType } from '@/types/models';

interface ModelMetricsProps {
  type: MLModelType;
  metrics: MLModelMetricsType;
  compact?: boolean;
}

interface MetricConfig {
  key: string;
  label: string;
  tooltip: string;
  formatter: (value: number) => string;
  isPercentage: boolean;
}

const CLASSIFICATION_METRICS: MetricConfig[] = [
  {
    key: 'accuracy',
    label: 'Accuracy',
    tooltip: 'Overall correctness of predictions',
    formatter: (v) => `${(v * 100).toFixed(1)}%`,
    isPercentage: true,
  },
  {
    key: 'precision',
    label: 'Precision',
    tooltip: 'Ratio of correct positive predictions',
    formatter: (v) => `${(v * 100).toFixed(1)}%`,
    isPercentage: true,
  },
  {
    key: 'recall',
    label: 'Recall',
    tooltip: 'Ratio of actual positives identified',
    formatter: (v) => `${(v * 100).toFixed(1)}%`,
    isPercentage: true,
  },
  {
    key: 'f1',
    label: 'F1 Score',
    tooltip: 'Harmonic mean of precision and recall',
    formatter: (v) => `${(v * 100).toFixed(1)}%`,
    isPercentage: true,
  },
];

const REGRESSION_METRICS: MetricConfig[] = [
  {
    key: 'rmse',
    label: 'RMSE',
    tooltip: 'Root Mean Squared Error',
    formatter: (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    isPercentage: false,
  },
  {
    key: 'mae',
    label: 'MAE',
    tooltip: 'Mean Absolute Error',
    formatter: (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    isPercentage: false,
  },
  {
    key: 'r2',
    label: 'R² Score',
    tooltip: 'Coefficient of determination',
    formatter: (v) => v.toFixed(3),
    isPercentage: false,
  },
];

export function ModelMetrics({ type, metrics, compact = false }: ModelMetricsProps) {
  const configs = type === 'classification' ? CLASSIFICATION_METRICS : REGRESSION_METRICS;
  const availableMetrics = configs.filter((config) =>
    metrics[config.key as keyof MLModelMetricsType] !== undefined
  );

  if (availableMetrics.length === 0) {
    return (
      <div className="text-sm text-[#9b92c9]">
        No metrics available
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {availableMetrics.map((config, index) => {
        const value = metrics[config.key as keyof MLModelMetricsType] as number;
        const percentage = config.isPercentage ? value * 100 : null;

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className={compact ? 'text-xs text-[#9b92c9]' : 'text-sm text-[#9b92c9]'}>
                  {config.label}
                </span>
                <div className="group relative">
                  <HelpCircle className="w-3 h-3 text-[#9b92c9] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-[#1e1a36] border border-[#3b3267] rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap shadow-lg">
                      {config.tooltip}
                    </div>
                  </div>
                </div>
              </div>
              <span className={compact ? 'text-xs font-mono text-white' : 'text-sm font-mono text-white font-medium'}>
                {config.formatter(value)}
              </span>
            </div>
            {config.isPercentage && percentage !== null && (
              <div className="w-full h-1.5 bg-[#1e1a36] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#3713ec] to-[#22c55e] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.05 + 0.1, duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
