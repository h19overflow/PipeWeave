import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { EncoderOption } from '@/types/pipeline-editor';

interface SurgicalSwapDropdownProps {
  currentOption: string;
  options: EncoderOption[];
  onSelect: (option: EncoderOption) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function SurgicalSwapDropdown({
  currentOption,
  options,
  onSelect,
  isOpen,
  onToggle,
}: SurgicalSwapDropdownProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 },
    }),
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        className="w-full bg-pe-primary text-white rounded p-2 text-left text-xs font-bold flex items-center justify-between ring-2 ring-pe-primary/50"
      >
        Current: {currentOption}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="material-symbols-outlined text-[16px]"
        >
          expand_more
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={prefersReducedMotion ? undefined : dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 bg-[#292348] border border-[#4f467e] rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-3 py-2 text-[10px] text-pe-text-secondary uppercase font-bold bg-pe-surface border-b border-[#4f467e]">
              Surgical Swap
            </div>

            {/* Options */}
            <div className="max-h-[160px] overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  custom={index}
                  variants={prefersReducedMotion ? {} : itemVariants}
                  initial="hidden"
                  animate="visible"
                  onHoverStart={() => setHoveredOption(option.id)}
                  onHoverEnd={() => setHoveredOption(null)}
                  onClick={() => onSelect(option)}
                  className="w-full text-left px-3 py-2 text-xs text-white hover:bg-pe-primary hover:text-white flex items-center justify-between group transition-colors"
                >
                  <span>{option.name}</span>
                  <AnimatePresence>
                    {option.isRecommended && hoveredOption === option.id && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded"
                      >
                        Recommended
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}

              {/* Divider */}
              <div className="border-t border-[#4f467e] my-1" />

              {/* Browse Library */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                className="w-full text-left px-3 py-2 text-xs text-pe-text-secondary hover:text-white flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[14px]">search</span>
                Browse Library...
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
