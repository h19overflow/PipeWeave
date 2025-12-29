/**
 * BeforeAfterPreview - Toggle between original and transformed data views
 * Crossfade animation with cell highlighting and stats comparison
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { PreprocessingPreview } from '@/types/preprocessing';

interface BeforeAfterPreviewProps {
  preview: PreprocessingPreview;
}

type ViewMode = 'original' | 'transformed';

export function BeforeAfterPreview({ preview }: BeforeAfterPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<ViewMode>('original');

  const isOriginal = viewMode === 'original';
  const sampleData = isOriginal ? preview.sampleBefore : preview.sampleAfter;
  const columns = isOriginal ? preview.originalColumns : [...preview.originalColumns.filter(c => !preview.removedColumns.includes(c)), ...preview.newColumns];

  return (
    <div className="bg-[#131022] border border-[#1e1a36] rounded-lg overflow-hidden">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e1a36]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">preview</span>
          Data Preview
        </h3>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2 p-1 bg-[#1e1a36] rounded-lg">
          {(['original', 'transformed'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all', viewMode === mode ? 'bg-[#3713ec] text-white shadow' : 'text-[#9b92c9] hover:text-white')}
            >
              {mode === 'original' ? 'Original' : 'Transformed'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 px-4 py-2 bg-[#0f0c1d] border-b border-[#1e1a36] text-xs">
        <span className="text-[#9b92c9]">
          Rows: <span className={cn('font-mono', !isOriginal && preview.originalRows !== preview.transformedRows && 'text-yellow-400')}>
            {isOriginal ? preview.originalRows.toLocaleString() : preview.transformedRows.toLocaleString()}
          </span>
        </span>
        <span className="text-[#9b92c9]">
          Columns: <span className="font-mono">{columns.length}</span>
        </span>
        {!isOriginal && preview.newColumns.length > 0 && (
          <span className="text-green-400">+{preview.newColumns.length} new</span>
        )}
        {!isOriginal && preview.removedColumns.length > 0 && (
          <span className="text-red-400">-{preview.removedColumns.length} removed</span>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <AnimatePresence mode="wait">
          <motion.table
            key={viewMode}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full text-sm"
          >
            <thead>
              <tr className="border-b border-[#1e1a36]">
                {columns.slice(0, 8).map(col => {
                  const isNew = preview.newColumns.includes(col);
                  const isRemoved = preview.removedColumns.includes(col);
                  return (
                    <th
                      key={col}
                      className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider', isNew ? 'text-green-400 bg-green-500/5' : isRemoved ? 'text-red-400 line-through' : 'text-[#9b92c9]')}
                    >
                      {col}
                      {isNew && <span className="ml-1 text-[10px]">NEW</span>}
                    </th>
                  );
                })}
                {columns.length > 8 && (
                  <th className="px-4 py-3 text-xs text-[#6b6490]">+{columns.length - 8} more</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sampleData.slice(0, 5).map((row, rowIdx) => (
                <motion.tr
                  key={rowIdx}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.05 }}
                  className="border-b border-[#1e1a36]/50 hover:bg-[#1e1a36]/30"
                >
                  {columns.slice(0, 8).map(col => {
                    const value = row[col];
                    const isNew = preview.newColumns.includes(col);
                    const displayValue = value === null || value === undefined ? '-' : String(value);
                    const isNull = value === null || value === undefined;

                    return (
                      <td
                        key={col}
                        className={cn('px-4 py-2 font-mono text-xs', isNew && 'bg-green-500/5', isNull && 'text-[#6b6490] italic')}
                      >
                        <span className={cn(isNew ? 'text-green-400' : 'text-white')}>
                          {displayValue.length > 20 ? `${displayValue.slice(0, 20)}...` : displayValue}
                        </span>
                      </td>
                    );
                  })}
                  {columns.length > 8 && <td className="px-4 py-2 text-[#6b6490]">...</td>}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </AnimatePresence>
      </div>

      <div className="px-4 py-2 text-xs text-[#6b6490] text-center border-t border-[#1e1a36]">
        Showing first 5 rows of {isOriginal ? preview.originalRows.toLocaleString() : preview.transformedRows.toLocaleString()}
      </div>
    </div>
  );
}
