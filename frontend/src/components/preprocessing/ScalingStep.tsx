/**
 * ScalingStep - Configure scaling strategies for numeric columns
 * Shows current distribution and expected output after scaling
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ColumnInfo, ScalingStrategy, ScalingStrategyType } from '@/types/preprocessing';
import { SCALING_STRATEGY_OPTIONS } from '@/types/preprocessing';

interface ScalingStepProps {
  columns: ColumnInfo[];
  strategies: Record<string, ScalingStrategy>;
  onStrategyChange: (column: string, strategy: ScalingStrategy) => void;
}

// Mini distribution visualization
function DistributionBar({ values, scaled }: { values: number[]; scaled?: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.slice(0, 10).map((v, i) => {
        const height = scaled ? ((v - min) / range) * 100 : ((v - min) / range) * 100;
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(height, 10)}%` }}
            className={cn('w-2 rounded-t', scaled ? 'bg-[#22c55e]' : 'bg-[#3713ec]')}
          />
        );
      })}
    </div>
  );
}

export function ScalingStep({ columns, strategies, onStrategyChange }: ScalingStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const numericColumns = columns.filter(c => c.type === 'Integer' || c.type === 'Float');

  if (numericColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-[#9b92c9] mb-4">straighten</span>
        <h3 className="text-lg font-semibold text-white mb-2">No Numeric Columns</h3>
        <p className="text-sm text-[#9b92c9]">No numeric columns found in selection. Continue to review.</p>
      </div>
    );
  }

  const handleTypeChange = (column: string, type: ScalingStrategyType) => {
    onStrategyChange(column, { type });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#9b92c9]">
          {numericColumns.length} numeric column{numericColumns.length !== 1 ? 's' : ''} to scale
        </p>
        <button
          onClick={() => numericColumns.forEach(c => handleTypeChange(c.name, 'standard'))}
          className="text-xs text-[#3713ec] hover:underline"
        >
          Set all to Standard
        </button>
      </div>

      <div className="space-y-3">
        {numericColumns.map((col, index) => {
          const strategy = strategies[col.name] || { type: 'standard' };
          const numericValues = col.sampleValues.filter((v): v is number => typeof v === 'number');

          return (
            <motion.div
              key={col.name}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#131022] border border-[#1e1a36] rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{col.name}</span>
                    <span className={cn('px-2 py-0.5 text-xs font-mono rounded', col.type === 'Integer' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400')}>
                      {col.type}
                    </span>
                  </div>

                  {/* Distribution Preview */}
                  {numericValues.length > 0 && (
                    <div className="flex items-center gap-6 mt-3">
                      <div>
                        <p className="text-xs text-[#6b6490] mb-1">Current</p>
                        <DistributionBar values={numericValues} />
                      </div>
                      <span className="material-symbols-outlined text-[#9b92c9]">arrow_forward</span>
                      <div>
                        <p className="text-xs text-[#6b6490] mb-1">After</p>
                        <DistributionBar values={numericValues} scaled />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mt-3 text-xs text-[#6b6490]">
                    {numericValues.length > 0 && (
                      <>
                        <span>Min: {Math.min(...numericValues).toFixed(2)}</span>
                        <span>Max: {Math.max(...numericValues).toFixed(2)}</span>
                        <span>Mean: {(numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>

                <select
                  value={strategy.type}
                  onChange={e => handleTypeChange(col.name, e.target.value as ScalingStrategyType)}
                  className="px-3 py-2 bg-[#1e1a36] border border-[#2a2545] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50 min-w-[140px]"
                >
                  {SCALING_STRATEGY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-[#6b6490] mt-3">
                {SCALING_STRATEGY_OPTIONS.find(o => o.value === strategy.type)?.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
