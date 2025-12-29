/**
 * TypeSelect - Animated dropdown for manual type override
 */
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import type { DataType } from '@/types/schema-deduction';
import { ALL_DATA_TYPES, DATA_TYPE_COLORS } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface TypeSelectProps {
  value: DataType | null;
  onChange: (type: DataType) => void;
  placeholder?: string;
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

export function TypeSelect({ value, onChange, placeholder = 'Select type' }: TypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colors = value ? DATA_TYPE_COLORS[value] : null;

  return (
    <div ref={containerRef} className="relative flex-1">
      <motion.button
        className={cn(
          'w-full bg-[#292348] border border-[#3b3267] text-sm rounded-lg py-1.5 pl-3 pr-8',
          'text-left font-mono cursor-pointer transition-colors',
          'focus:ring-1 focus:ring-[#3713ec] focus:border-[#3713ec]',
          value ? colors?.text : 'text-[#9b92c9]'
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      >
        {value || placeholder}
      </motion.button>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b92c9]">
        <motion.span
          className="material-symbols-outlined text-[16px]"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          expand_more
        </motion.span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50 w-full mt-1 bg-[#1e1933] border border-[#3b3267]
                       rounded-lg shadow-xl overflow-hidden"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {ALL_DATA_TYPES.map((type, index) => {
              const typeColors = DATA_TYPE_COLORS[type];
              return (
                <motion.button
                  key={type}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm font-mono transition-colors',
                    'hover:bg-[#292348]',
                    type === value ? typeColors.text : 'text-white'
                  )}
                  variants={itemVariants}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  onClick={() => {
                    onChange(type);
                    setIsOpen(false);
                  }}
                  whileHover={prefersReducedMotion ? {} : { x: 4 }}
                >
                  {type}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
