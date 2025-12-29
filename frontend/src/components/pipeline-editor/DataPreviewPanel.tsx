import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { DataPreviewConfig } from '@/types/pipeline-editor';

interface DataPreviewPanelProps {
  config: DataPreviewConfig;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function DataPreviewPanel({ config, isExpanded = true, onToggle }: DataPreviewPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const panelVariants = {
    collapsed: { height: 48 },
    expanded: { height: 256 },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  // Column color mapping based on data type
  const getValueColor = (column: string, value: string | number) => {
    if (column === 'Contract_Type') {
      return value === 'Month-to-month' ? 'text-pe-primary-light' : 'text-green-400';
    }
    if (column === 'Churn') {
      return value === 'Yes' ? 'text-green-400' : 'text-red-400';
    }
    if (column === 'User_ID' || column.includes('Charges')) {
      return 'text-white';
    }
    return 'text-pe-text-secondary';
  };

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : panelVariants}
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute bottom-0 left-0 right-0 border-t border-pe-border bg-[#141122] flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-pe-border bg-pe-surface min-h-[48px]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-pe-text-secondary text-sm">table_view</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Data Preview: {config.fileName}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-pe-primary/10 text-pe-primary text-[10px] font-mono">
            {config.rowCount.toLocaleString()} Rows
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
            className="p-1 hover:bg-white/10 rounded"
          >
            <span className="material-symbols-outlined text-sm">download</span>
          </motion.button>
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
            onClick={onToggle}
            className="p-1 hover:bg-white/10 rounded"
          >
            <motion.span
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-sm"
            >
              expand_more
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-auto flex-1"
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-pe-surface sticky top-0 z-10">
                <tr>
                  {config.columns.map((column) => (
                    <th
                      key={column}
                      className={cn(
                        'px-4 py-2 text-[10px] font-bold text-pe-text-secondary uppercase border-b border-pe-border',
                        (column.includes('Charges') || column === 'Churn') && 'text-right',
                        column === 'Churn' && 'text-center'
                      )}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {config.data.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    custom={rowIndex}
                    variants={prefersReducedMotion ? {} : rowVariants}
                    initial="hidden"
                    animate="visible"
                    onHoverStart={() => setHoveredRow(rowIndex)}
                    onHoverEnd={() => setHoveredRow(null)}
                    className={cn(
                      'transition-colors',
                      rowIndex % 2 === 0 ? 'bg-[#141122]' : 'bg-[#1a172c]',
                      hoveredRow === rowIndex && 'bg-pe-border'
                    )}
                  >
                    {config.columns.map((column) => {
                      const value = row[column] ?? '';
                      return (
                        <td
                          key={column}
                          className={cn(
                            'px-4 py-2 border-b border-white/5',
                            getValueColor(column, value),
                            column === 'Contract_Type' && 'font-bold',
                            (column.includes('Charges') || column === 'Churn') && 'text-right',
                            column === 'Churn' && 'text-center'
                          )}
                        >
                          {String(value)}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
