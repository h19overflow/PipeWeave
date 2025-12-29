/**
 * TransformQueuePanel - List of pending transformations with reorder/remove
 * Shows operation order and allows drag reordering
 */

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Transform } from '@/types/preprocessing';

interface TransformQueuePanelProps {
  transforms: Transform[];
  onReorder: (transforms: Transform[]) => void;
  onRemove: (id: string) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const CATEGORY_COLORS = {
  missing: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  encoding: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  scaling: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
};

export function TransformQueuePanel({ transforms, onReorder, onRemove, onUndo, canUndo }: TransformQueuePanelProps) {
  const prefersReducedMotion = useReducedMotion();

  if (transforms.length === 0) {
    return (
      <div className="bg-[#131022] border border-[#1e1a36] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">queue</span>
          Transform Queue
        </h3>
        <p className="text-xs text-[#6b6490] text-center py-4">
          No transformations queued yet.
          <br />
          Configure options above to add transforms.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#131022] border border-[#1e1a36] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">queue</span>
          Transform Queue ({transforms.length})
        </h3>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn('text-xs flex items-center gap-1 transition', canUndo ? 'text-[#3713ec] hover:underline' : 'text-[#6b6490] cursor-not-allowed')}
        >
          <span className="material-symbols-outlined text-sm">undo</span>
          Undo
        </button>
      </div>

      <Reorder.Group
        axis="y"
        values={transforms}
        onReorder={onReorder}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {transforms.map((transform, index) => {
            const colors = CATEGORY_COLORS[transform.category];
            return (
              <Reorder.Item
                key={transform.id}
                value={transform}
                as="div"
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, height: 0, marginBottom: 0 }}
                whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing', colors.bg, colors.border)}
              >
                <span className="text-xs font-bold text-[#6b6490] w-5">{index + 1}</span>

                <span className="material-symbols-outlined text-[#6b6490] text-sm">drag_indicator</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{transform.column}</p>
                  <p className={cn('text-xs', colors.text)}>{transform.operation}</p>
                </div>

                <motion.button
                  onClick={() => onRemove(transform.id)}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  className="p-1 rounded hover:bg-white/10 transition"
                >
                  <span className="material-symbols-outlined text-[#9b92c9] text-lg">close</span>
                </motion.button>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      <p className="text-xs text-[#6b6490] mt-3 text-center">
        Drag to reorder transformations
      </p>
    </div>
  );
}
