/**
 * SchemaTable - Main data table for schema deduction results
 * Features GSAP row reveals and interactive row animations
 */
import { motion, useReducedMotion } from 'framer-motion';
import { ConfidenceBar } from './ConfidenceBar';
import { TypeBadge } from './TypeBadge';
import { TypeSelect } from './TypeSelect';
import { LockButton } from './LockButton';
import { useTableAnimation, useRowHoverAnimation } from '@/hooks/useTableAnimation';
import type { ColumnDeduction, DataType } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface SchemaTableProps {
  columns: ColumnDeduction[];
  onLockToggle: (id: string) => void;
  onOverrideChange: (id: string, type: DataType) => void;
  isLoading?: boolean;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#292348] rounded" />
          <div className="h-4 w-24 bg-[#292348] rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-16 bg-[#292348] rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5 max-w-[140px]">
          <div className="h-3 w-full bg-[#292348] rounded" />
          <div className="h-1.5 w-full bg-[#292348] rounded-full" />
        </div>
      </td>
      <td className="px-6 py-4 border-l border-l-[#3b3267]/50 bg-[#1e1933]/30">
        <div className="h-8 w-full bg-[#292348] rounded" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="w-8 h-8 bg-[#292348] rounded-lg mx-auto" />
      </td>
    </tr>
  );
}

function TableHeader() {
  return (
    <thead className="bg-[#1e1933] sticky top-0 z-10">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-[#9b92c9]
                       uppercase tracking-wider w-[20%] border-b border-[#3b3267]">
          Column Name
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-[#9b92c9]
                       uppercase tracking-wider w-[20%] border-b border-[#3b3267]">
          AI Type Deduction
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-[#9b92c9]
                       uppercase tracking-wider w-[25%] border-b border-[#3b3267]">
          Confidence
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-[#9b92c9]
                       uppercase tracking-wider w-[25%] border-b border-[#3b3267]
                       pl-8 border-l border-l-[#3b3267]/50 bg-[#1e1933]/50">
          Manual Override
        </th>
        <th className="px-6 py-4 text-center text-xs font-semibold text-[#9b92c9]
                       uppercase tracking-wider w-[10%] border-b border-[#3b3267]">
          Status
        </th>
      </tr>
    </thead>
  );
}

export function SchemaTable({
  columns,
  onLockToggle,
  onOverrideChange,
  isLoading = false,
}: SchemaTableProps) {
  const { containerRef } = useTableAnimation<HTMLTableSectionElement>(columns.length);
  const { handleMouseEnter, handleMouseLeave } = useRowHoverAnimation();
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className="border border-[#3b3267] rounded-xl overflow-hidden bg-[#141122] shadow-2xl">
        <table className="w-full border-collapse">
          <TableHeader />
          <tbody className="divide-y divide-[#3b3267]">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <motion.div
      className="border border-[#3b3267] rounded-xl overflow-hidden bg-[#141122] shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
    >
      <table className="w-full border-collapse">
        <TableHeader />
        <tbody ref={containerRef} className="divide-y divide-[#3b3267]">
          {columns.map((col, index) => (
            <tr
              key={col.id}
              data-table-row
              className={cn(
                'group transition-colors',
                col.needsReview && 'bg-yellow-500/5'
              )}
              onMouseEnter={prefersReducedMotion ? undefined : handleMouseEnter}
              onMouseLeave={prefersReducedMotion ? undefined : handleMouseLeave}
              style={{ position: 'relative' }}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9b92c9] text-[16px]">
                    {col.icon}
                  </span>
                  <span className="text-white font-mono text-sm">{col.name}</span>
                  {col.needsReview && (
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-yellow-500 ml-1"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      title="Low Confidence"
                    />
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <TypeBadge type={col.aiType} />
              </td>

              <td className="px-6 py-4">
                <ConfidenceBar
                  value={col.confidence}
                  level={col.confidenceLevel}
                  delay={0.3 + index * 0.1}
                />
              </td>

              <td className="px-6 py-4 border-l border-l-[#3b3267]/50 bg-[#1e1933]/30
                             group-hover:bg-[#1e1933]/50 transition-colors">
                {col.needsReview || col.manualOverride ? (
                  <TypeSelect
                    value={col.manualOverride}
                    onChange={(type) => onOverrideChange(col.id, type)}
                    placeholder="Select override"
                  />
                ) : (
                  <span className="text-[#9b92c9] text-sm italic">No override</span>
                )}
              </td>

              <td className="px-6 py-4 text-center">
                <LockButton isLocked={col.isLocked} onToggle={() => onLockToggle(col.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
