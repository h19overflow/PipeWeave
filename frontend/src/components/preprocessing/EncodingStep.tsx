/**
 * EncodingStep - Configure encoding strategies for categorical columns
 * Shows cardinality warnings and preview of new columns
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ColumnInfo, EncodingStrategy, EncodingStrategyType } from '@/types/preprocessing';
import { ENCODING_STRATEGY_OPTIONS } from '@/types/preprocessing';

interface EncodingStepProps {
  columns: ColumnInfo[];
  strategies: Record<string, EncodingStrategy>;
  onStrategyChange: (column: string, strategy: EncodingStrategy) => void;
}

const HIGH_CARDINALITY_THRESHOLD = 20;

export function EncodingStep({ columns, strategies, onStrategyChange }: EncodingStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const categoricalColumns = columns.filter(c => c.type === 'Category' || c.type === 'String');

  if (categoricalColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-[#9b92c9] mb-4">category</span>
        <h3 className="text-lg font-semibold text-white mb-2">No Categorical Columns</h3>
        <p className="text-sm text-[#9b92c9]">No categorical columns found in selection. Continue to scaling.</p>
      </div>
    );
  }

  const handleTypeChange = (column: string, type: EncodingStrategyType) => {
    const current = strategies[column] || { type: 'label' };
    onStrategyChange(column, { ...current, type });
  };

  const getNewColumnsPreview = (col: ColumnInfo, strategy: EncodingStrategy): string[] => {
    if (strategy.type === 'onehot') {
      const count = Math.min(col.uniqueCount, 5);
      return Array.from({ length: count }, (_, i) => `${col.name}_${col.sampleValues[i] || i}`);
    }
    return [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#9b92c9]">
          {categoricalColumns.length} categorical column{categoricalColumns.length !== 1 ? 's' : ''} to encode
        </p>
        <button
          onClick={() => categoricalColumns.forEach(c => handleTypeChange(c.name, 'label'))}
          className="text-xs text-[#3713ec] hover:underline"
        >
          Set all to Label
        </button>
      </div>

      <div className="space-y-3">
        {categoricalColumns.map((col, index) => {
          const strategy = strategies[col.name] || { type: 'label' };
          const isHighCardinality = col.uniqueCount > HIGH_CARDINALITY_THRESHOLD;
          const newColumns = getNewColumnsPreview(col, strategy);

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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white truncate">{col.name}</span>
                    <span className="px-2 py-0.5 text-xs font-mono bg-orange-500/10 text-orange-400 rounded">{col.type}</span>
                    <span className="text-xs text-[#6b6490]">{col.uniqueCount} unique values</span>
                  </div>

                  {isHighCardinality && strategy.type === 'onehot' && (
                    <motion.div
                      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 mt-2 text-xs text-yellow-400"
                    >
                      <span className="material-symbols-outlined text-sm">warning</span>
                      High cardinality - One-Hot will create {col.uniqueCount} new columns
                    </motion.div>
                  )}

                  {newColumns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newColumns.map(name => (
                        <span key={name} className="px-2 py-0.5 text-xs bg-[#1e1a36] text-[#9b92c9] rounded font-mono">
                          +{name}
                        </span>
                      ))}
                      {col.uniqueCount > 5 && <span className="text-xs text-[#6b6490]">+{col.uniqueCount - 5} more</span>}
                    </div>
                  )}
                </div>

                <select
                  value={strategy.type}
                  onChange={e => handleTypeChange(col.name, e.target.value as EncodingStrategyType)}
                  className="px-3 py-2 bg-[#1e1a36] border border-[#2a2545] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50 min-w-[120px]"
                >
                  {ENCODING_STRATEGY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-[#6b6490] mt-3">
                {ENCODING_STRATEGY_OPTIONS.find(o => o.value === strategy.type)?.desc}
              </p>

              {/* Sample Values */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                <span className="text-xs text-[#6b6490] shrink-0">Sample:</span>
                {col.sampleValues.slice(0, 5).map((v, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-[#1e1a36] text-[#9b92c9] rounded font-mono whitespace-nowrap">
                    {String(v)}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
