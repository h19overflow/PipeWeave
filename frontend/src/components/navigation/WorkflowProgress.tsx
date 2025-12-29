/**
 * Visual progress indicator showing workflow completion
 * Displays current step, completed steps, and connecting lines
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { WORKFLOW_NAV_ITEMS, type WorkflowStep } from './navigation.config';

interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  completedSteps?: WorkflowStep[];
  isCollapsed?: boolean;
}

export function WorkflowProgress({
  currentStep,
  completedSteps = [],
  isCollapsed
}: WorkflowProgressProps) {
  const prefersReducedMotion = useReducedMotion();

  const currentStepNumber = WORKFLOW_NAV_ITEMS.find(item => item.id === currentStep)?.step || 1;
  const totalSteps = WORKFLOW_NAV_ITEMS.length;
  const progressPercentage = ((currentStepNumber - 1) / (totalSteps - 1)) * 100;

  if (isCollapsed) return null;

  return (
    <div className="px-4 py-3 border-t border-b border-[#1e1a36]">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#9b92c9]">Workflow Progress</span>
        <span className="text-xs font-bold text-white">
          {currentStepNumber}/{totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-[#1e1a36] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#3713ec] to-[#4a2aff] rounded-full"
          initial={prefersReducedMotion ? { width: `${progressPercentage}%` } : { width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-3">
        {WORKFLOW_NAV_ITEMS.map((item, index) => {
          const isCompleted = completedSteps.includes(item.id);
          const isCurrent = item.id === currentStep;

          return (
            <div key={item.id} className="flex flex-col items-center gap-1">
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'size-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold',
                  'transition-colors',
                  isCompleted
                    ? 'bg-[#22c55e] border-[#22c55e] text-white'
                    : isCurrent
                    ? 'bg-[#3713ec] border-[#3713ec] text-white'
                    : 'bg-[#131022] border-[#1e1a36] text-[#9b92c9]'
                )}
              >
                {isCompleted ? '✓' : item.step}
              </motion.div>

              {/* Connecting Line */}
              {index < WORKFLOW_NAV_ITEMS.length - 1 && (
                <div className="absolute top-3 w-full h-0.5 bg-[#1e1a36] -z-10"
                  style={{
                    left: `${(100 / (totalSteps - 1)) * index}%`,
                    width: `${100 / (totalSteps - 1)}%`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Label */}
      <p className="text-xs text-center text-[#9b92c9] mt-2">
        {WORKFLOW_NAV_ITEMS.find(item => item.id === currentStep)?.label}
      </p>
    </div>
  );
}
