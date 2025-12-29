/**
 * LockButton - Animated toggle for locking schema deductions
 * Features state change animation with icon swap
 */
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LockButtonProps {
  isLocked: boolean;
  onToggle: () => void;
}

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  exit: { scale: 0, rotate: 180 },
};

export function LockButton({ isLocked, onToggle }: LockButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center border mx-auto transition-colors',
        isLocked
          ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
          : 'bg-[#1e1933] text-[#9b92c9] border-[#3b3267] hover:text-white hover:border-white'
      )}
      onClick={onToggle}
      whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isLocked ? 'locked' : 'unlocked'}
          className="material-symbols-outlined text-[18px]"
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {isLocked ? 'lock' : 'lock_open'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
