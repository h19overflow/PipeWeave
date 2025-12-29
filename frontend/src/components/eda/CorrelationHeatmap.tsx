/**
 * CorrelationHeatmap - Interactive correlation matrix visualization
 * SVG-based heatmap with hover tooltips and color gradient
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Grid3X3 } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { CorrelationEntry } from '@/types/eda';

interface CorrelationHeatmapProps {
  correlations: CorrelationEntry[];
  columns: string[];
}

function getCorrelationColor(value: number): string {
  if (value >= 0.7) return '#10b981';
  if (value >= 0.4) return '#3b82f6';
  if (value >= 0) return '#6366f1';
  if (value >= -0.4) return '#f59e0b';
  return '#ef4444';
}

function getCorrelationOpacity(value: number): number {
  return 0.3 + Math.abs(value) * 0.7;
}

export function CorrelationHeatmap({ correlations, columns }: CorrelationHeatmapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ col1: string; col2: string; value: number } | null>(null);

  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    columns.forEach((col) => {
      matrix[col] = {};
      columns.forEach((c) => {
        const colRecord = matrix[col];
        if (colRecord) colRecord[c] = col === c ? 1 : 0;
      });
    });
    correlations.forEach(({ col1, col2, value }) => {
      const r1 = matrix[col1];
      const r2 = matrix[col2];
      if (r1 && r2) { r1[col2] = value; r2[col1] = value; }
    });
    return matrix;
  }, [correlations, columns]);

  const cellSize = Math.min(40, 300 / columns.length);
  const gridSize = cellSize * columns.length;
  const labelOffset = 80;

  return (
    <div className="bg-[#131022] border border-[#1e1a36] rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-white">
          <Grid3X3 size={16} className="text-[#3713ec]" />
          <span className="font-medium">Correlation Matrix</span>
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
            <div className="p-4 relative">
              {/* Tooltip */}
              {hoveredCell && (
                <div className="absolute top-2 right-4 bg-[#0a0a0f] border border-[#1e1a36] rounded-lg px-3 py-2 text-xs z-10">
                  <div className="text-[#9b92c9]">{hoveredCell.col1} vs {hoveredCell.col2}</div>
                  <div className="font-mono font-bold" style={{ color: getCorrelationColor(hoveredCell.value) }}>
                    r = {hoveredCell.value.toFixed(3)}
                  </div>
                </div>
              )}

              {/* Heatmap SVG */}
              <div className="overflow-x-auto">
                <svg width={gridSize + labelOffset} height={gridSize + labelOffset} className="mx-auto">
                  {/* Y-axis labels */}
                  {columns.map((col, i) => (
                    <text key={`y-${col}`} x={labelOffset - 4} y={labelOffset + i * cellSize + cellSize / 2} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#9b92c9" className="select-none">
                      {col.slice(0, 8)}{col.length > 8 ? '...' : ''}
                    </text>
                  ))}

                  {/* X-axis labels */}
                  {columns.map((col, i) => (
                    <text key={`x-${col}`} x={labelOffset + i * cellSize + cellSize / 2} y={labelOffset - 4} textAnchor="middle" fontSize={10} fill="#9b92c9" className="select-none" transform={`rotate(-45, ${labelOffset + i * cellSize + cellSize / 2}, ${labelOffset - 4})`}>
                      {col.slice(0, 8)}{col.length > 8 ? '...' : ''}
                    </text>
                  ))}

                  {/* Cells */}
                  {columns.map((col1, i) =>
                    columns.map((col2, j) => {
                      const value = correlationMatrix[col1]?.[col2] ?? 0;
                      return (
                        <motion.rect
                          key={`${col1}-${col2}`}
                          x={labelOffset + j * cellSize}
                          y={labelOffset + i * cellSize}
                          width={cellSize - 1}
                          height={cellSize - 1}
                          rx={2}
                          fill={getCorrelationColor(value)}
                          fillOpacity={getCorrelationOpacity(value)}
                          onMouseEnter={() => setHoveredCell({ col1, col2, value })}
                          onMouseLeave={() => setHoveredCell(null)}
                          whileHover={{ scale: 1.1 }}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })
                  )}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4 text-xs text-[#9b92c9]">
                <span className="flex items-center gap-1"><span className="size-3 rounded" style={{ backgroundColor: '#ef4444' }} /> -1</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded" style={{ backgroundColor: '#6366f1' }} /> 0</span>
                <span className="flex items-center gap-1"><span className="size-3 rounded" style={{ backgroundColor: '#10b981' }} /> +1</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
