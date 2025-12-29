/**
 * QualityScoreBadge - Circular progress indicator for data quality score
 * Animated ring with color transitions based on score thresholds
 */

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface QualityScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { dimension: 48, strokeWidth: 4, fontSize: 'text-sm' },
  md: { dimension: 72, strokeWidth: 5, fontSize: 'text-xl' },
  lg: { dimension: 96, strokeWidth: 6, fontSize: 'text-2xl' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export function QualityScoreBadge({ score, size = 'md', showLabel = true, className }: QualityScoreBadgeProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const config = SIZE_CONFIG[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  const springValue = useSpring(0, { stiffness: 60, damping: 20 });
  const strokeDashoffset = useTransform(springValue, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    if (!hasAnimated) {
      springValue.set(score);
      setHasAnimated(true);
    }
  }, [score, springValue, hasAnimated]);

  useEffect(() => {
    if (hasAnimated) springValue.set(score);
  }, [score, springValue, hasAnimated]);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        {/* Background ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${config.dimension} ${config.dimension}`}>
          <circle cx={config.dimension / 2} cy={config.dimension / 2} r={radius} fill="none" stroke="#1e1a36" strokeWidth={config.strokeWidth} />
        </svg>

        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${config.dimension} ${config.dimension}`}>
          <motion.circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset, filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>

        {/* Score value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={score}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn('font-bold', config.fontSize)}
            style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {Math.round(score)}
          </motion.span>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs text-[#9b92c9] uppercase tracking-wider">Quality Score</span>
          <span className="text-sm font-medium" style={{ color }}>{getScoreLabel(score)}</span>
        </div>
      )}
    </div>
  );
}
