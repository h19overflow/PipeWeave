import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface ChartBar {
  id: string;
  value: number;
  label: string;
  excluded?: boolean;
}

const defaultBars: ChartBar[] = [
  { id: '1', value: 40, label: 'Count: 420' },
  { id: '2', value: 65, label: 'Count: 840' },
  { id: '3', value: 85, label: 'Count: 1.2k' },
  { id: '4', value: 55, label: 'Count: 650' },
  { id: '5', value: 90, label: 'Excluded: Outlier', excluded: true },
  { id: '6', value: 95, label: 'Excluded: Outlier', excluded: true },
];

interface ImpactChartProps {
  bars?: ChartBar[];
  className?: string;
}

export function ImpactChart({ bars = defaultBars, className }: ImpactChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.7,
        ease: 'power2.out',
        onComplete: () => setIsVisible(true),
      }
    );
  }, [prefersReducedMotion]);

  return (
    <section ref={containerRef} className={cn('flex flex-col gap-4', className)}>
      <h3 className="text-white font-medium text-lg">Impact Distribution</h3>

      <div
        className={cn(
          'w-full h-48 bg-surface-dark border border-border-dark rounded-xl p-6',
          'relative overflow-hidden flex items-end gap-2'
        )}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#3b3267 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Chart Bars */}
        {bars.map((bar, index) => (
          <ChartBarComponent
            key={bar.id}
            bar={bar}
            index={index}
            isVisible={isVisible}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </section>
  );
}

interface ChartBarComponentProps {
  bar: ChartBar;
  index: number;
  isVisible: boolean;
  prefersReducedMotion: boolean;
}

function ChartBarComponent({
  bar,
  index,
  isVisible,
  prefersReducedMotion,
}: ChartBarComponentProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 15,
    restDelta: 0.001,
  });

  const height = useTransform(springValue, (v) => `${v}%`);

  useEffect(() => {
    if (!isVisible) return;

    if (prefersReducedMotion) {
      springValue.set(bar.value);
      return;
    }

    const delay = index * 100;
    const timeout = setTimeout(() => {
      springValue.set(bar.value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, bar.value, index, prefersReducedMotion, springValue]);

  const handleMouseEnter = useCallback(() => setShowTooltip(true), []);
  const handleMouseLeave = useCallback(() => setShowTooltip(false), []);

  return (
    <div
      className="flex-1 relative h-full flex items-end"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded',
              'text-xs whitespace-nowrap border font-mono z-10',
              bar.excluded
                ? 'bg-surface-darker text-red-400 border-red-900/50'
                : 'bg-surface-darker text-white border-border-dark'
            )}
          >
            {bar.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bar */}
      {bar.excluded ? (
        <ExcludedBar
          height={height}
          value={bar.value}
          prefersReducedMotion={prefersReducedMotion}
          isHovered={showTooltip}
        />
      ) : (
        <IncludedBar
          height={height}
          value={bar.value}
          prefersReducedMotion={prefersReducedMotion}
          isHighest={bar.value >= 80}
          isHovered={showTooltip}
        />
      )}
    </div>
  );
}

interface BarProps {
  height: ReturnType<typeof useTransform<number, string>>;
  value: number;
  prefersReducedMotion: boolean;
  isHighest?: boolean;
  isHovered?: boolean;
}

function IncludedBar({ height, prefersReducedMotion, isHighest, isHovered }: BarProps) {
  return (
    <motion.div
      className={cn(
        'absolute bottom-0 left-0 right-0 rounded-t-sm transition-colors duration-200',
        isHighest
          ? 'bg-primary shadow-[0_0_15px_rgba(55,19,236,0.3)]'
          : 'bg-primary/20'
      )}
      style={{ height: prefersReducedMotion ? undefined : height }}
      animate={{
        backgroundColor: isHovered
          ? isHighest
            ? 'rgba(55, 19, 236, 0.9)'
            : 'rgba(55, 19, 236, 0.5)'
          : isHighest
            ? 'rgba(55, 19, 236, 1)'
            : 'rgba(55, 19, 236, 0.2)',
        scaleY: isHovered ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    />
  );
}

function ExcludedBar({ height, prefersReducedMotion, isHovered }: BarProps) {
  return (
    <motion.div
      className={cn(
        'absolute bottom-0 left-0 right-0 rounded-t-sm',
        'border border-dashed'
      )}
      style={{ height: prefersReducedMotion ? undefined : height }}
      animate={{
        borderColor: isHovered
          ? 'rgba(239, 68, 68, 0.6)'
          : ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.5)', 'rgba(239, 68, 68, 0.3)'],
        backgroundColor: isHovered
          ? 'rgba(239, 68, 68, 0.15)'
          : ['rgba(239, 68, 68, 0.05)', 'rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)'],
      }}
      transition={
        isHovered
          ? { duration: 0.2 }
          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }
    />
  );
}
