/**
 * ConfidenceBar - Animated progress bar for confidence visualization
 * Uses Framer Motion for scroll-triggered fill animation
 */
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { ConfidenceLevel } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  value: number;
  level: ConfidenceLevel;
  delay?: number;
}

const LEVEL_CONFIG: Record<ConfidenceLevel, { label: string; barColor: string; textColor: string }> = {
  High: { label: 'High', barColor: 'bg-[#3713ec]', textColor: 'text-[#9b92c9]' },
  Medium: { label: 'Medium', barColor: 'bg-[#3713ec]', textColor: 'text-[#9b92c9]' },
  Review: { label: 'Review', barColor: 'bg-yellow-500', textColor: 'text-yellow-500 font-medium' },
};

export function ConfidenceBar({ value, level, delay = 0 }: ConfidenceBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  const config = LEVEL_CONFIG[level];
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div ref={ref} className="flex flex-col gap-1.5 w-full max-w-[140px]">
      <div className="flex justify-between items-end">
        <span className={cn('text-xs', config.textColor)}>{config.label}</span>
        <span className="text-xs font-mono text-white">{clampedValue}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#292348] rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', config.barColor)}
          initial={{ width: prefersReducedMotion ? `${clampedValue}%` : '0%' }}
          animate={isInView ? { width: `${clampedValue}%` } : { width: '0%' }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
            delay: prefersReducedMotion ? 0 : delay,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </div>
    </div>
  );
}
