/**
 * MissingValuesMatrix - Visual grid showing missing data patterns
 * Displays column-wise missing value distribution with summary bar
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Grid2X2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { MissingMatrixEntry } from '@/types/eda';

interface MissingValuesMatrixProps {
  missingMatrix: MissingMatrixEntry[];
  totalRows: number;
  sampleSize?: number;
}

export function MissingValuesMatrix({ missingMatrix, totalRows, sampleSize = 50 }: MissingValuesMatrixProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { matrix, columnStats } = useMemo(() => {
    const step = Math.max(1, Math.floor(totalRows / sampleSize));
    const sampleIndices = Array.from({ length: sampleSize }, (_, i) => i * step);
    const stats: Record<string, { missing: number; percentage: number }> = {};
    const missingSets: Record<string, Set<number>> = {};

    missingMatrix.forEach(({ column, missingIndices }) => {
      missingSets[column] = new Set(missingIndices);
      stats[column] = { missing: missingIndices.length, percentage: (missingIndices.length / totalRows) * 100 };
    });

    const grid = sampleIndices.map((rowIdx) => {
      return missingMatrix.reduce((acc, { column }) => {
        acc[column] = missingSets[column]?.has(rowIdx) ?? false;
        return acc;
      }, {} as Record<string, boolean>);
    });

    return { matrix: grid, columnStats: stats };
  }, [missingMatrix, totalRows, sampleSize]);

  const columns = missingMatrix.map((m) => m.column);
  const cellWidth = Math.min(24, 400 / columns.length);

  return (
    <div className="bg-[#131022] border border-[#1e1a36] rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-white">
          <Grid2X2 size={16} className="text-amber-400" />
          <span className="font-medium">Missing Values Pattern</span>
          <span className="text-xs text-[#9b92c9]">({columns.length} columns)</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-[#9b92c9]" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Column headers */}
                  <div className="flex gap-px mb-1 pl-8">
                    {columns.map((col) => (
                      <div
                        key={col}
                        className="text-[8px] text-[#9b92c9] truncate transform -rotate-45 origin-left"
                        style={{ width: cellWidth, minWidth: cellWidth }}
                        title={col}
                      >
                        {col.slice(0, 6)}
                      </div>
                    ))}
                  </div>

                  {/* Matrix rows */}
                  <div className="flex flex-col gap-px mt-6">
                    {matrix.slice(0, 30).map((row, rowIdx) => (
                      <div key={rowIdx} className="flex gap-px items-center">
                        <div className="w-8 text-[8px] text-[#9b92c9] text-right pr-1">{rowIdx * Math.floor(totalRows / sampleSize)}</div>
                        {columns.map((col) => (
                          <div
                            key={col}
                            className="rounded-sm transition-colors"
                            style={{
                              width: cellWidth - 1,
                              height: 6,
                              backgroundColor: row[col] ? '#ef444480' : '#10b98130',
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary bar */}
              <div className="space-y-2">
                <div className="text-xs text-[#9b92c9] uppercase tracking-wider">Missing % per Column</div>
                <div className="flex gap-1 items-end h-16">
                  {columns.map((col) => {
                    const pct = columnStats[col]?.percentage || 0;
                    const barColor = pct > 20 ? '#ef4444' : pct > 5 ? '#f59e0b' : '#10b981';
                    return (
                      <div key={col} className="flex-1 flex flex-col items-center group relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(2, pct * 0.6)}px` }}
                          transition={{ duration: 0.5, delay: columns.indexOf(col) * 0.02 }}
                          className="w-full rounded-t-sm"
                          style={{ backgroundColor: barColor, minHeight: 2, maxHeight: 40 }}
                        />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0a0a0f] border border-[#1e1a36] rounded px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {col}: {pct.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-xs text-[#9b92c9]">
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-[#10b98130]" /> Present</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-[#ef444480]" /> Missing</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
