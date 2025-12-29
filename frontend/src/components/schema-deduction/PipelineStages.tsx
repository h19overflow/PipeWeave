/**
 * PipelineStages - Vertical timeline showing workflow progression
 * Active stage pulsates, completed stages have checkmark animation
 */
import { motion, useReducedMotion } from 'framer-motion';
import type { PipelineStage, PipelineStageStatus } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface PipelineStagesProps {
  stages: PipelineStage[];
  className?: string;
}

const stageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

function StageIcon({ status, icon }: { status: PipelineStageStatus; icon: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (status === 'completed') {
    return (
      <motion.div
        className="w-8 h-8 rounded-full bg-[#1e1933] border border-green-500/50
                   flex items-center justify-center text-green-400
                   shadow-[0_0_10px_rgba(74,222,128,0.2)]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span className="material-symbols-outlined text-[18px]">check</span>
      </motion.div>
    );
  }

  if (status === 'active') {
    return (
      <motion.div
        className="w-8 h-8 rounded-full bg-[#3713ec] flex items-center justify-center
                   text-white shadow-[0_0_15px_rgba(55,19,236,0.6)] ring-4 ring-[#3713ec]/20"
        animate={prefersReducedMotion ? {} : {
          boxShadow: [
            '0 0 15px rgba(55,19,236,0.6)',
            '0 0 25px rgba(55,19,236,0.8)',
            '0 0 15px rgba(55,19,236,0.6)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="material-symbols-outlined text-[18px]"
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          sync
        </motion.span>
      </motion.div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-[#1e1933] border border-[#3b3267]
                    flex items-center justify-center text-[#9b92c9]">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </div>
  );
}

export function PipelineStages({ stages, className }: PipelineStagesProps) {
  return (
    <div className={cn('relative pl-2', className)}>
      <div className="absolute left-[19px] top-2 bottom-0 w-[1.5px] bg-[#3b3267]" />

      {stages.map((stage, index) => {
        const isPending = stage.status === 'pending';
        const isActive = stage.status === 'active';

        return (
          <motion.div
            key={stage.id}
            className={cn('relative flex gap-4 mb-6 last:mb-0', isPending && 'opacity-50')}
            variants={stageVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            <div className="z-10 flex flex-col items-center">
              <StageIcon status={stage.status} icon={stage.icon} />
            </div>
            <div className="pt-1">
              <p className={cn(
                'text-sm font-medium',
                isActive ? 'font-bold text-[#3713ec]' : isPending ? 'text-[#9b92c9]' : 'text-white'
              )}>
                {stage.name}
              </p>
              <p className={cn(
                'text-xs mt-0.5',
                stage.status === 'completed' ? 'text-green-400' : 'text-[#9b92c9]'
              )}>
                {stage.statusText}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
