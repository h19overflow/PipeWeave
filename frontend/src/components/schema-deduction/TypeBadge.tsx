/**
 * TypeBadge - Animated data type indicator with hover effects
 */
import { motion, useReducedMotion } from 'framer-motion';
import type { DataType } from '@/types/schema-deduction';
import { DATA_TYPE_COLORS } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface TypeBadgeProps {
  type: DataType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const colors = DATA_TYPE_COLORS[type];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
      whileHover={prefersReducedMotion ? {} : {
        scale: 1.05,
        transition: { duration: 0.15 },
      }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      {type}
    </motion.span>
  );
}
