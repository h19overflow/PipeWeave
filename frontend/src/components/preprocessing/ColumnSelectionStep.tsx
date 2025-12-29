/**
 * ColumnSelectionStep - Column selection interface with type filtering
 * Checklist UI for selecting columns to include in preprocessing
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ColumnInfo } from '@/types/preprocessing';
import type { DataType } from '@/types/schema-deduction';
import { DATA_TYPE_COLORS } from '@/types/schema-deduction';

interface ColumnSelectionStepProps {
  columns: ColumnInfo[];
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
}

const TYPE_FILTERS: DataType[] = ['Integer', 'Float', 'String', 'Category', 'Boolean', 'Datetime'];

export function ColumnSelectionStep({ columns, selectedColumns, onSelectionChange }: ColumnSelectionStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const [typeFilter, setTypeFilter] = useState<DataType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColumns = useMemo(() => {
    return columns.filter(col => {
      const matchesType = typeFilter === 'all' || col.type === typeFilter;
      const matchesSearch = col.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [columns, typeFilter, searchQuery]);

  const handleSelectAll = () => onSelectionChange(filteredColumns.map(c => c.name));
  const handleDeselectAll = () => onSelectionChange([]);

  const toggleColumn = (name: string) => {
    onSelectionChange(
      selectedColumns.includes(name)
        ? selectedColumns.filter(c => c !== name)
        : [...selectedColumns, name]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9b92c9] text-lg">search</span>
          <input
            type="text"
            placeholder="Search columns..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1a36] border border-[#2a2545] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSelectAll} className="px-3 py-1.5 text-xs font-medium text-[#9b92c9] hover:text-white bg-[#1e1a36] rounded-md transition">
            Select All
          </button>
          <button onClick={handleDeselectAll} className="px-3 py-1.5 text-xs font-medium text-[#9b92c9] hover:text-white bg-[#1e1a36] rounded-md transition">
            Clear
          </button>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn('px-3 py-1 text-xs rounded-full border transition', typeFilter === 'all' ? 'bg-[#3713ec] border-[#3713ec] text-white' : 'border-[#2a2545] text-[#9b92c9] hover:border-[#3713ec]')}
        >
          All Types
        </button>
        {TYPE_FILTERS.map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn('px-3 py-1 text-xs rounded-full border transition', DATA_TYPE_COLORS[type].border, typeFilter === type ? `${DATA_TYPE_COLORS[type].bg} ${DATA_TYPE_COLORS[type].text}` : 'text-[#9b92c9] hover:border-[#3713ec]')}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Column List */}
      <div className="bg-[#131022] border border-[#1e1a36] rounded-lg divide-y divide-[#1e1a36] max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredColumns.map((col, index) => {
            const isSelected = selectedColumns.includes(col.name);
            const colors = DATA_TYPE_COLORS[col.type];
            return (
              <motion.label
                key={col.name}
                layout={!prefersReducedMotion}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn('flex items-center gap-4 p-3 cursor-pointer transition-colors', isSelected ? 'bg-[#3713ec]/10' : 'hover:bg-[#1e1a36]/50')}
              >
                <input type="checkbox" checked={isSelected} onChange={() => toggleColumn(col.name)} className="size-4 rounded border-[#2a2545] bg-[#1e1a36] text-[#3713ec] focus:ring-[#3713ec]/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{col.name}</p>
                  <p className="text-xs text-[#6b6490]">{col.nullCount} nulls, {col.uniqueCount} unique</p>
                </div>
                <span className={cn('px-2 py-0.5 text-xs font-mono rounded', colors.bg, colors.text)}>{col.type}</span>
              </motion.label>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="text-xs text-[#6b6490]">{selectedColumns.length} of {columns.length} columns selected</p>
    </div>
  );
}
