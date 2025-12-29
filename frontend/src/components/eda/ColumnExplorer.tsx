/**
 * ColumnExplorer - Searchable column list with quality indicators
 * Displays column metadata with dtype badges and quality traffic lights
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ColumnAnalysis, QualityStatus, ColumnDType } from '@/types/eda';
import { DTYPE_COLORS } from '@/types/eda';

interface ColumnExplorerProps {
  columns: ColumnAnalysis[];
  selectedColumn: string | null;
  onSelectColumn: (name: string) => void;
}

function QualityIndicator({ status }: { status: QualityStatus }) {
  const colors = { healthy: '#10b981', warning: '#f59e0b', critical: '#ef4444' };
  return (
    <motion.div
      className="size-2 rounded-full"
      style={{ backgroundColor: colors[status], boxShadow: `0 0 8px ${colors[status]}60` }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function DTypeBadge({ dtype }: { dtype: ColumnDType }) {
  const colors = DTYPE_COLORS[dtype];
  return (
    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border', colors.bg, colors.text, colors.border)}>
      {dtype}
    </span>
  );
}

function ColumnRow({ column, isSelected, onSelect }: { column: ColumnAnalysis; isSelected: boolean; onSelect: () => void }) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ x: 2 }}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        isSelected ? 'bg-[#3713ec]/20 border border-[#3713ec]/40' : 'hover:bg-white/5 border border-transparent'
      )}
    >
      <QualityIndicator status={column.qualityStatus} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium truncate', isSelected ? 'text-white' : 'text-[#e0dce8]')}>
            {column.name}
          </span>
          <DTypeBadge dtype={column.dtype} />
        </div>
        <div className="text-xs text-[#9b92c9] mt-0.5">
          {column.nullPercentage > 0 ? `${column.nullPercentage.toFixed(1)}% null` : 'No nulls'} | {column.uniqueCount} unique
        </div>
      </div>
      <ChevronRight size={14} className={cn('text-[#9b92c9] transition-transform', isSelected && 'text-[#3713ec] rotate-0')} />
    </motion.button>
  );
}

export function ColumnExplorer({ columns, selectedColumn, onSelectColumn }: ColumnExplorerProps) {
  const [search, setSearch] = useState('');

  const filteredColumns = useMemo(() => {
    if (!search.trim()) return columns;
    const q = search.toLowerCase();
    return columns.filter((c) => c.name.toLowerCase().includes(q) || c.dtype.toLowerCase().includes(q));
  }, [columns, search]);

  return (
    <div className="flex flex-col h-full bg-[#131022] border border-[#1e1a36] rounded-lg overflow-hidden">
      {/* Search header */}
      <div className="p-3 border-b border-[#1e1a36]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b92c9]" />
          <input
            type="text"
            placeholder="Search columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0f] border border-[#1e1a36] rounded-lg text-sm text-white placeholder:text-[#9b92c9]/60 focus:outline-none focus:border-[#3713ec]/50"
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-[#9b92c9]">
          <span>{filteredColumns.length} columns</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400" /> Healthy</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-400" /> Warning</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-400" /> Critical</span>
        </div>
      </div>

      {/* Column list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredColumns.map((column) => (
            <motion.div key={column.name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ColumnRow column={column} isSelected={selectedColumn === column.name} onSelect={() => onSelectColumn(column.name)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredColumns.length === 0 && <p className="text-center text-sm text-[#9b92c9] py-8">No columns match "{search}"</p>}
      </div>
    </div>
  );
}
