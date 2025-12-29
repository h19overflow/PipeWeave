/**
 * ReturnToStepButton - Quick action to return to previous workflow step
 * Used in later stages to easily navigate back to EDA or Preprocessing
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Wand2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type StepType = 'eda' | 'preprocessing';

interface ReturnToStepButtonProps {
  step: StepType;
  hasChanges?: boolean; // Show indicator if this step has pending changes
}

const STEP_CONFIG = {
  eda: {
    label: 'Return to EDA',
    path: '/eda',
    icon: BarChart3,
    description: 'Review data analysis',
  },
  preprocessing: {
    label: 'Return to Preprocessing',
    path: '/preprocessing',
    icon: Wand2,
    description: 'Adjust transformations',
  },
} as const;

export function ReturnToStepButton({ step, hasChanges }: ReturnToStepButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = STEP_CONFIG[step];
  const Icon = config.icon;

  return (
    <Link to={config.path}>
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.02, x: -2 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        className="group relative inline-flex items-center gap-2 px-3 py-2 bg-[#131022] hover:bg-[#1a1430] border border-[#1e1a36] hover:border-[#3713ec]/40 rounded-lg transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-[#9b92c9] group-hover:text-[#3713ec] transition-colors" />
        <Icon className="w-4 h-4 text-[#9b92c9] group-hover:text-white transition-colors" />
        <span className="text-sm text-[#9b92c9] group-hover:text-white transition-colors">
          {config.label}
        </span>

        {/* Changes indicator dot */}
        {hasChanges && (
          <motion.span
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"
          >
            <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-50" />
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}

/**
 * ReturnToStepGroup - Shows both return buttons together
 */
export function ReturnToStepGroup({
  edaHasChanges,
  preprocessingHasChanges,
}: {
  edaHasChanges?: boolean;
  preprocessingHasChanges?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <ReturnToStepButton step="eda" hasChanges={edaHasChanges} />
      <ReturnToStepButton step="preprocessing" hasChanges={preprocessingHasChanges} />
    </div>
  );
}
