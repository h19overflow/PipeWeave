/**
 * ColumnDetailPanel - Detailed column analysis with distribution visualization
 * Shows stats, histogram/bar chart, sample values, and AI recommendations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Sparkles, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ColumnAnalysis, NumericStats, CategoricalStats } from '@/types/eda';
import { DTYPE_COLORS } from '@/types/eda';

interface ColumnDetailPanelProps {
  column: ColumnAnalysis | null;
}

function StatsCard({ stats, dtype }: { stats: NumericStats | CategoricalStats; dtype: 'numeric' | 'categorical' | 'datetime' | 'text' }) {
  const isNumeric = dtype === 'numeric';
  const numStats = stats as NumericStats;
  const catStats = stats as CategoricalStats;

  const items = isNumeric
    ? [
        { label: 'Mean', value: numStats.mean?.toFixed(2) },
        { label: 'Median', value: numStats.median?.toFixed(2) },
        { label: 'Std Dev', value: numStats.std?.toFixed(2) },
        { label: 'Min', value: numStats.min?.toFixed(2) },
        { label: 'Max', value: numStats.max?.toFixed(2) },
        { label: 'Skewness', value: numStats.skewness?.toFixed(2) },
      ]
    : [
        { label: 'Unique', value: catStats.uniqueCount },
        { label: 'Mode', value: catStats.mode },
        { label: 'Entropy', value: catStats.entropy?.toFixed(2) },
      ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="bg-[#0a0a0f] border border-[#1e1a36] rounded-lg p-2.5">
          <div className="text-[10px] text-[#9b92c9] uppercase tracking-wider">{item.label}</div>
          <div className="text-sm font-mono font-medium text-white mt-0.5 truncate">{item.value ?? '-'}</div>
        </div>
      ))}
    </div>
  );
}

function DistributionChart({ distribution }: { distribution: { bin: string; count: number }[] }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="bin" tick={{ fontSize: 10, fill: '#9b92c9' }} axisLine={{ stroke: '#1e1a36' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9b92c9' }} axisLine={{ stroke: '#1e1a36' }} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#131022', border: '1px solid #1e1a36', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e0dce8' }}
            itemStyle={{ color: '#3713ec' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {distribution.map((_, index) => (
              <Cell key={index} fill="#3713ec" fillOpacity={0.8 + (index / distribution.length) * 0.2} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ColumnDetailPanel({ column }: ColumnDetailPanelProps) {
  if (!column) {
    return (
      <div className="h-full flex items-center justify-center bg-[#131022] border border-[#1e1a36] rounded-lg">
        <div className="text-center text-[#9b92c9]">
          <BarChart3 size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Select a column to view details</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={column.name}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.25 }}
        className="h-full bg-[#131022] border border-[#1e1a36] rounded-lg p-4 space-y-4 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{column.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-mono ${DTYPE_COLORS[column.dtype].bg} ${DTYPE_COLORS[column.dtype].text}`}>
            {column.dtype}
          </span>
        </div>

        {/* Distribution */}
        <div>
          <h4 className="text-xs text-[#9b92c9] uppercase tracking-wider mb-2 flex items-center gap-2">
            <BarChart3 size={12} /> Distribution
          </h4>
          <DistributionChart distribution={column.distribution} />
        </div>

        {/* Stats */}
        {column.stats && (
          <div>
            <h4 className="text-xs text-[#9b92c9] uppercase tracking-wider mb-2">Statistics</h4>
            <StatsCard stats={column.stats} dtype={column.dtype} />
          </div>
        )}

        {/* Sample Values */}
        <div>
          <h4 className="text-xs text-[#9b92c9] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Eye size={12} /> Sample Values
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {column.sampleValues.slice(0, 5).map((val, i) => (
              <span key={i} className="px-2 py-1 bg-[#0a0a0f] border border-[#1e1a36] rounded text-xs font-mono text-[#e0dce8]">
                {val}
              </span>
            ))}
          </div>
        </div>

        {/* AI Recommendation */}
        {column.recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#3713ec]/10 border border-[#3713ec]/30 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-[#3713ec] mt-0.5 shrink-0" />
              <p className="text-sm text-[#e0dce8]">{column.recommendation}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
