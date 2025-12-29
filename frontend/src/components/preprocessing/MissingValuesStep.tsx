/**
 * MissingValuesStep - Configure missing value handling per column
 * Dropdown strategy selection with null count display and preview
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ColumnInfo, MissingStrategy, MissingStrategyType } from '@/types/preprocessing';
import { MISSING_STRATEGY_OPTIONS } from '@/types/preprocessing';

interface MissingValuesStepProps {
  columns: ColumnInfo[];
  strategies: Record<string, MissingStrategy>;
  onStrategyChange: (column: string, strategy: MissingStrategy) => void;
}

export function MissingValuesStep({ columns, strategies, onStrategyChange }: MissingValuesStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const columnsWithNulls = columns.filter(c => c.nullCount > 0);

  if (columnsWithNulls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-[#22c55e] mb-4">check_circle</span>
        <h3 className="text-lg font-semibold text-white mb-2">No Missing Values</h3>
        <p className="text-sm text-[#9b92c9]">All selected columns have complete data. Continue to the next step.</p>
      </div>
    );
  }

  const handleTypeChange = (column: string, type: MissingStrategyType) => {
    const current = strategies[column] || { type: 'drop' };
    onStrategyChange(column, { ...current, type });
  };

  const handleConstantChange = (column: string, value: string) => {
    onStrategyChange(column, { type: 'constant', value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#9b92c9]">
          {columnsWithNulls.length} column{columnsWithNulls.length !== 1 ? 's' : ''} with missing values
        </p>
        <button
          onClick={() => columnsWithNulls.forEach(c => handleTypeChange(c.name, 'drop'))}
          className="text-xs text-[#3713ec] hover:underline"
        >
          Set all to Drop
        </button>
      </div>

      <div className="space-y-3">
        {columnsWithNulls.map((col, index) => {
          const strategy = strategies[col.name] || { type: 'drop' };
          const nullPercent = ((col.nullCount / (col.nullCount + col.uniqueCount)) * 100).toFixed(1);

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
                    <span className="px-2 py-0.5 text-xs font-mono bg-[#1e1a36] text-[#9b92c9] rounded">{col.type}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-red-400">
                      <span className="material-symbols-outlined text-sm align-middle mr-1">warning</span>
                      {col.nullCount.toLocaleString()} nulls ({nullPercent}%)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <select
                    value={strategy.type}
                    onChange={e => handleTypeChange(col.name, e.target.value as MissingStrategyType)}
                    className="px-3 py-2 bg-[#1e1a36] border border-[#2a2545] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50"
                  >
                    {MISSING_STRATEGY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {strategy.type === 'constant' && (
                    <motion.input
                      initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      type="text"
                      placeholder="Enter value..."
                      value={String(strategy.value || '')}
                      onChange={e => handleConstantChange(col.name, e.target.value)}
                      className="px-3 py-2 bg-[#1e1a36] border border-[#2a2545] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50"
                    />
                  )}
                </div>
              </div>

              {/* Strategy Description */}
              <p className="text-xs text-[#6b6490] mt-3">
                {MISSING_STRATEGY_OPTIONS.find(o => o.value === strategy.type)?.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
