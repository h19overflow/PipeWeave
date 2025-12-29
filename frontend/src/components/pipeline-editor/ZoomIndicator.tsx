import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ZoomIndicatorProps {
  scale: number;
  className?: string;
}

/**
 * Displays current zoom level with animated transitions.
 * Shows percentage value with visual feedback on zoom changes.
 */
export const ZoomIndicator = memo(function ZoomIndicator({ scale, className = '' }: ZoomIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = Math.round(scale * 100);

  // Color coding for zoom level
  const getZoomColor = () => {
    if (percentage < 50) return 'text-yellow-400';
    if (percentage > 150) return 'text-blue-400';
    return 'text-[#9b92c9]';
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute bottom-4 left-4 z-10 ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#131022]/90 border border-[#1e1a36] rounded-lg backdrop-blur-sm shadow-lg">
        <span className="material-symbols-outlined text-sm text-[#9b92c9]">zoom_in</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={percentage}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className={`text-xs font-mono font-medium min-w-[40px] text-center ${getZoomColor()}`}
          >
            {percentage}%
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
