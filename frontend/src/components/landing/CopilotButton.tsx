import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const bubbleVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const buttonVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 15px rgba(90, 92, 242, 0.3)',
  },
  tap: { scale: 0.98 },
};

export function CopilotButton() {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Message Bubble */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="glass-panel p-4 rounded-lg rounded-br-none shadow-2xl w-64 mb-2"
            variants={prefersReducedMotion ? undefined : bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2 rounded-full bg-[var(--success)] shadow-[0_0_5px_var(--success)]" />
              <span className="text-[10px] font-mono text-[var(--slate-400)] uppercase tracking-widest">
                Agent Reasoning
              </span>
            </div>
            <p className="text-xs text-[var(--slate-200)] font-mono leading-relaxed">
              Analysis complete. The swapped MinMaxScaler aligns better with the
              non-gaussian distribution in feature `tx_amount`.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        className="relative flex items-center gap-3 bg-[var(--slate-900)] border border-[var(--slate-700)] hover:border-[var(--primary)] text-white pl-4 pr-2 py-2 rounded-full shadow-lg transition-colors"
        variants={prefersReducedMotion ? undefined : buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pulse Ring */}
        {!prefersReducedMotion && (
          <motion.span
            className="absolute inset-0 rounded-full border border-[var(--primary)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <span className="text-sm font-bold">Copilot</span>
        <div className="size-8 rounded-full bg-[var(--slate-800)] flex items-center justify-center border border-[var(--slate-700)]">
          <Bot className="w-4 h-4 text-[var(--primary)]" />
        </div>
      </motion.button>
    </div>
  );
}
