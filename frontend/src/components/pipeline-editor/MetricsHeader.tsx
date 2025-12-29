import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { MetricData } from '@/types/pipeline-editor';

interface MetricsHeaderProps {
  pipelineName: string;
  version: string;
  metrics: MetricData[];
  onSave?: () => void;
  onRun?: () => void;
}

function AnimatedMetricValue({ value, duration = 1.5 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const suffix = value.match(/[^0-9.]*$/)?.[0] || '';

  useEffect(() => {
    if (prefersReducedMotion || !ref.current || isNaN(numericValue)) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: numericValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${obj.val.toFixed(2)}${suffix}`;
        }
      },
    });
  }, [numericValue, duration, prefix, suffix, prefersReducedMotion]);

  return (
    <span ref={ref} className="font-mono text-sm font-bold text-white">
      {value}
    </span>
  );
}

function DeltaIndicator({ delta, type }: { delta: string; type: 'positive' | 'negative' | 'neutral' }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      initial={prefersReducedMotion ? {} : { scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 1.5 }}
      className={cn(
        'text-[10px] font-mono',
        type === 'positive' && 'text-green-400',
        type === 'negative' && 'text-orange-400',
        type === 'neutral' && 'text-pe-text-secondary'
      )}
    >
      {delta}
    </motion.span>
  );
}

export function MetricsHeader({ pipelineName, version, metrics, onSave, onRun }: MetricsHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHoveredMetric, setIsHoveredMetric] = useState<number | null>(null);

  return (
    <header className="h-16 border-b border-pe-border bg-[#141122] flex items-center justify-between px-6 z-10">
      {/* Pipeline Name */}
      <motion.div
        initial={prefersReducedMotion ? {} : { x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-pe-text-secondary font-normal">Pipeline /</span>
          {pipelineName}
          <span className="px-2 py-0.5 rounded text-[10px] bg-pe-primary/20 text-pe-primary-light border border-pe-primary/20 font-mono font-bold">
            {version}
          </span>
        </h1>
      </motion.div>

      {/* Metrics Bar */}
      <motion.div
        initial={prefersReducedMotion ? {} : { y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex items-center gap-6 bg-pe-surface px-4 py-1.5 rounded-full border border-pe-border"
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            onHoverStart={() => setIsHoveredMetric(index)}
            onHoverEnd={() => setIsHoveredMetric(null)}
            animate={isHoveredMetric === index ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'flex items-center gap-2',
              index < metrics.length - 1 && 'border-r border-white/10 pr-4'
            )}
          >
            <span className="text-xs text-pe-text-secondary uppercase font-semibold">
              {metric.label}
            </span>
            <AnimatedMetricValue value={metric.value} />
            {metric.delta && metric.deltaType && (
              <DeltaIndicator delta={metric.delta} type={metric.deltaType} />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={prefersReducedMotion ? {} : { x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          onClick={onSave}
          className="h-9 px-4 rounded-lg bg-pe-surface hover:bg-pe-border border border-pe-border text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save
        </motion.button>
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.02, boxShadow: '0 10px 40px rgba(55, 19, 236, 0.4)' }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          onClick={onRun}
          className="h-9 px-4 rounded-lg bg-pe-primary hover:bg-pe-primary-light text-white text-sm font-bold shadow-lg shadow-pe-primary/30 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          Run Pipeline
        </motion.button>
      </motion.div>
    </header>
  );
}
