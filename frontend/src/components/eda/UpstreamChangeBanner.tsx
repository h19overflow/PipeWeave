/**
 * UpstreamChangeBanner - Reusable warning banner for stale data
 * Displays when upstream dataset changes invalidate current analysis
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UpstreamChangeBannerProps {
  message?: string;
  onRefresh?: () => void;
  onDismiss?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function UpstreamChangeBanner({
  message = 'Dataset was updated. Analysis may be outdated.',
  onRefresh,
  onDismiss,
  isRefreshing = false,
  className,
}: UpstreamChangeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className={cn('overflow-hidden', className)}
        >
          <div className="relative bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
            {/* Pulse animation overlay */}
            <motion.div
              className="absolute inset-0 bg-amber-500/5 rounded-lg"
              animate={{ opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative flex items-center gap-3">
              <AlertTriangle className="text-amber-400 shrink-0" size={18} />
              <p className="flex-1 text-sm text-amber-200">{message}</p>

              <div className="flex items-center gap-2">
                {onRefresh && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={cn(isRefreshing && 'animate-spin')} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}
                  </motion.button>
                )}

                {onDismiss && (
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-amber-500/20 rounded-md transition-colors"
                    aria-label="Dismiss"
                  >
                    <X size={16} className="text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
