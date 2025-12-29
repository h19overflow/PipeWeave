/**
 * UpstreamChangeBanner - Warning banner when schema has changed
 * Shows alert with reconfigure action button
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface UpstreamChangeBannerProps {
  isVisible: boolean;
  onReconfigure: () => void;
  onDismiss: () => void;
}

export function UpstreamChangeBanner({ isVisible, onReconfigure, onDismiss }: UpstreamChangeBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20, height: 0 }}
      className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-yellow-400 text-xl shrink-0">warning</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-300">Schema has been updated</p>
          <p className="text-xs text-yellow-400/80 mt-1">
            The upstream schema was modified. Your preprocessing configuration may be outdated and require reconfiguration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReconfigure}
            className="px-3 py-1.5 text-xs font-medium bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition"
          >
            Reconfigure
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-white/10 transition"
          >
            <span className="material-symbols-outlined text-yellow-400 text-lg">close</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
