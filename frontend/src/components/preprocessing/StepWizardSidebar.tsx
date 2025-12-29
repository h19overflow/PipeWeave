/**
 * StepWizardSidebar - Vertical step navigation for preprocessing wizard
 * Shows current step, completed steps with checkmarks, and clickable navigation
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { WIZARD_STEPS, type WizardStep } from '@/types/preprocessing';

interface StepWizardSidebarProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onStepClick: (step: WizardStep) => void;
}

export function StepWizardSidebar({ currentStep, completedSteps, onStepClick }: StepWizardSidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);

  return (
    <aside className="w-64 bg-[#131022] border-r border-[#1e1a36] p-4 flex flex-col">
      <h2 className="text-sm font-semibold text-[#9b92c9] uppercase tracking-wider mb-6">
        Preprocessing Steps
      </h2>

      <nav className="flex-1 relative">
        {/* Progress Line */}
        <div className="absolute left-[19px] top-6 w-0.5 h-[calc(100%-48px)] bg-[#1e1a36]">
          <motion.div
            className="w-full bg-gradient-to-b from-[#3713ec] to-[#22c55e] origin-top"
            initial={prefersReducedMotion ? { scaleY: currentIndex / (WIZARD_STEPS.length - 1) } : { scaleY: 0 }}
            animate={{ scaleY: currentIndex / (WIZARD_STEPS.length - 1) }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ height: '100%' }}
          />
        </div>

        <ul className="space-y-2">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isClickable = isCompleted || isCurrent;

            return (
              <motion.li
                key={step.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                    'focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50',
                    isCurrent && 'bg-[#3713ec]/20 border border-[#3713ec]/40',
                    isCompleted && !isCurrent && 'hover:bg-[#1e1a36]/50 cursor-pointer',
                    !isClickable && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <motion.div
                    className={cn(
                      'size-10 rounded-full flex items-center justify-center shrink-0 border-2',
                      isCompleted ? 'bg-[#22c55e] border-[#22c55e]' :
                      isCurrent ? 'bg-[#3713ec] border-[#3713ec] shadow-lg shadow-[#3713ec]/30' :
                      'bg-[#1e1a36] border-[#2a2545]'
                    )}
                    animate={isCurrent && !prefersReducedMotion ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-white text-lg">check</span>
                    ) : (
                      <span className={cn(
                        'material-symbols-outlined text-lg',
                        isCurrent ? 'text-white' : 'text-[#9b92c9]'
                      )}>{step.icon}</span>
                    )}
                  </motion.div>

                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-white' : 'text-[#9b92c9]')}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[#6b6490] truncate">{step.description}</p>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
