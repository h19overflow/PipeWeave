/**
 * ReviewStep - Summary of all preprocessing transformations
 * Shows before/after stats and Apply button with loading state
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { PreprocessingConfig, PreprocessingPreview } from '@/types/preprocessing';
import { MISSING_STRATEGY_OPTIONS, ENCODING_STRATEGY_OPTIONS, SCALING_STRATEGY_OPTIONS } from '@/types/preprocessing';

interface ReviewStepProps {
  config: PreprocessingConfig;
  preview: PreprocessingPreview;
  onApply: () => Promise<void>;
}

type ApplyState = 'idle' | 'loading' | 'success' | 'error';

export function ReviewStep({ config, preview, onApply }: ReviewStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const [applyState, setApplyState] = useState<ApplyState>('idle');

  const handleApply = async () => {
    setApplyState('loading');
    try {
      await onApply();
      setApplyState('success');
    } catch {
      setApplyState('error');
    }
  };

  const missingCount = Object.keys(config.missingValueStrategies).length;
  const encodingCount = Object.keys(config.encodingStrategies).length;
  const scalingCount = Object.keys(config.scalingStrategies).length;
  const totalTransforms = missingCount + encodingCount + scalingCount;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Columns Selected', value: config.selectedColumns.length, icon: 'checklist' },
          { label: 'Transformations', value: totalTransforms, icon: 'transform' },
          { label: 'Rows Before', value: preview.originalRows.toLocaleString(), icon: 'table_rows' },
          { label: 'Rows After', value: preview.transformedRows.toLocaleString(), icon: 'check_circle', highlight: preview.transformedRows !== preview.originalRows },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#131022] border border-[#1e1a36] rounded-lg p-4"
          >
            <span className="material-symbols-outlined text-[#9b92c9] text-xl">{stat.icon}</span>
            <p className={cn('text-2xl font-bold mt-2', stat.highlight ? 'text-yellow-400' : 'text-white')}>{stat.value}</p>
            <p className="text-xs text-[#6b6490]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Transformation Breakdown */}
      <div className="bg-[#131022] border border-[#1e1a36] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-white">Transformation Summary</h3>

        {missingCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#9b92c9] uppercase tracking-wider">Missing Values ({missingCount})</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.missingValueStrategies).map(([col, strategy]) => (
                <span key={col} className="px-2 py-1 text-xs bg-[#1e1a36] text-white rounded flex items-center gap-1">
                  <span className="text-[#9b92c9]">{col}:</span>
                  {MISSING_STRATEGY_OPTIONS.find(o => o.value === strategy.type)?.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {encodingCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#9b92c9] uppercase tracking-wider">Encoding ({encodingCount})</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.encodingStrategies).map(([col, strategy]) => (
                <span key={col} className="px-2 py-1 text-xs bg-[#1e1a36] text-white rounded flex items-center gap-1">
                  <span className="text-[#9b92c9]">{col}:</span>
                  {ENCODING_STRATEGY_OPTIONS.find(o => o.value === strategy.type)?.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {scalingCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#9b92c9] uppercase tracking-wider">Scaling ({scalingCount})</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.scalingStrategies).map(([col, strategy]) => (
                <span key={col} className="px-2 py-1 text-xs bg-[#1e1a36] text-white rounded flex items-center gap-1">
                  <span className="text-[#9b92c9]">{col}:</span>
                  {SCALING_STRATEGY_OPTIONS.find(o => o.value === strategy.type)?.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {preview.newColumns.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#1e1a36]">
            <p className="text-xs font-medium text-green-400">+{preview.newColumns.length} new columns</p>
            <div className="flex flex-wrap gap-1">
              {preview.newColumns.slice(0, 10).map(col => (
                <span key={col} className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded font-mono">{col}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <motion.button
        onClick={handleApply}
        disabled={applyState === 'loading' || applyState === 'success'}
        className={cn('w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all', applyState === 'success' ? 'bg-[#22c55e]' : 'bg-[#3713ec] hover:bg-[#3713ec]/90 shadow-lg shadow-[#3713ec]/25', 'disabled:opacity-70')}
        whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
      >
        <AnimatePresence mode="wait">
          {applyState === 'loading' && <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} transition={{ rotate: { repeat: Infinity, duration: 1, ease: 'linear' } }} className="material-symbols-outlined">progress_activity</motion.span>}
          {applyState === 'success' && <motion.span key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="material-symbols-outlined">check_circle</motion.span>}
          {applyState === 'idle' && <span className="material-symbols-outlined">play_arrow</span>}
        </AnimatePresence>
        {applyState === 'loading' ? 'Applying Transformations...' : applyState === 'success' ? 'Transformations Applied!' : 'Apply Transformations'}
      </motion.button>
    </div>
  );
}
