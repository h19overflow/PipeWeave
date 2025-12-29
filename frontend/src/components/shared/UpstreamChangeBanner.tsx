/**
 * UpstreamChangeBanner - Reusable banner for upstream data changes
 * Shows warning when upstream stage (dataset, schema, etc.) has changed
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface UpstreamChangeBannerProps {
  isVisible: boolean;
  message: string;
  onRefresh: () => void;
  onDismiss: () => void;
  refreshLabel?: string;
}

export function UpstreamChangeBanner({
  isVisible,
  message,
  onRefresh,
  onDismiss,
  refreshLabel = 'Refresh',
}: UpstreamChangeBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="sticky top-0 z-50 bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </motion.div>
              <span className="text-amber-200 text-sm font-medium">{message}</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                onClick={onRefresh}
                className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {refreshLabel}
              </motion.button>
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                onClick={onDismiss}
                className="p-1.5 hover:bg-amber-500/20 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-amber-400" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
