import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { CheckCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface DatasetMeta {
  source: string;
  schemaVersion: string;
  primaryKey: string;
}

interface ContextPanelProps {
  qualityScore?: number;
  rowCount?: number;
  lastUpdated?: string;
  metadata?: DatasetMeta;
}

const defaultMetadata: DatasetMeta = {
  source: 'transactions_2023',
  schemaVersion: 'v4.2 (Prod)',
  primaryKey: 'transaction_id',
};

export function ContextPanel({
  qualityScore = 94,
  rowCount = 1200000,
  lastUpdated = '14m',
  metadata = defaultMetadata,
}: ContextPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (!panelRef.current) return;

    gsap.fromTo(
      panelRef.current,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.out',
        onComplete: () => setIsVisible(true),
      }
    );
  }, [prefersReducedMotion]);

  return (
    <aside
      ref={panelRef}
      className={cn(
        'flex w-[320px] flex-col border-r border-border-dark',
        'bg-background-dark shrink-0 overflow-hidden'
      )}
    >
      <div className="p-6 pb-2 border-b border-border-dark/50">
        <h2 className="text-lg font-bold text-white mb-1">Context</h2>
        <p className="text-xs text-text-muted">Dataset metadata & quality</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <MetadataList metadata={metadata} isVisible={isVisible} />

        <div className="flex flex-col gap-4">
          <QualityScoreCard score={qualityScore} isVisible={isVisible} />
          <RowCountCard count={rowCount} isVisible={isVisible} />
          <LastUpdatedCard time={lastUpdated} isVisible={isVisible} />
        </div>
      </div>
    </aside>
  );
}

function MetadataList({ metadata, isVisible }: { metadata: DatasetMeta; isVisible: boolean }) {
  const items = [
    { label: 'Dataset Source', value: metadata.source },
    { label: 'Schema Version', value: metadata.schemaVersion },
    { label: 'Primary Key', value: metadata.primaryKey },
  ];

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={isVisible ? {} : { opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'grid grid-cols-[1fr_auto] gap-2 items-start',
            'pb-3 border-b border-border-dark/50 border-dashed'
          )}
        >
          <p className="text-text-muted text-sm">{item.label}</p>
          <p className="text-white text-sm font-mono text-right truncate max-w-[150px]">
            {item.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function QualityScoreCard({ score, isVisible }: { score: number; isVisible: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const circleRef = useRef<SVGCircleElement>(null);
  const { value, start } = useCountUp({ end: score, duration: 1.5, delay: 0.3 });

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!isVisible) return;
    start();

    if (prefersReducedMotion || !circleRef.current) return;

    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset, duration: 1.5, delay: 0.3, ease: 'power2.out' }
    );
  }, [isVisible, score, start, prefersReducedMotion, circumference, strokeDashoffset]);

  return (
    <motion.div
      initial={isVisible ? {} : { opacity: 0, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.2 }}
      className={cn(
        'flex flex-col gap-3 rounded-xl p-4 border border-border-dark',
        'bg-surface-dark/50 relative overflow-hidden group'
      )}
    >
      <motion.div
        className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-2xl"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="flex items-center justify-between z-10">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
          Quality Score
        </p>
        <CheckCircle className="size-4 text-green-400" />
      </div>

      <div className="flex items-center gap-4 z-10">
        <div className="relative size-20 shrink-0">
          <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(59, 50, 103, 0.5)"
              strokeWidth="6"
            />
            <circle
              ref={circleRef}
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#qualityGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={prefersReducedMotion ? strokeDashoffset : circumference}
            />
            <defs>
              <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3713ec" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl font-bold font-mono">{value}</span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-white text-sm font-medium">Excellent</span>
          <span className="text-text-muted text-xs">Data quality is optimal</span>
        </div>
      </div>
    </motion.div>
  );
}

function RowCountCard({ count, isVisible }: { count: number; isVisible: boolean }) {
  const { value, start } = useCountUp({
    end: count / 1000000,
    duration: 1.5,
    delay: 0.4,
    decimals: 1,
  });

  useEffect(() => {
    if (isVisible) start();
  }, [isVisible, start]);

  return (
    <motion.div
      initial={isVisible ? {} : { opacity: 0, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.3 }}
      className="flex flex-col gap-1 rounded-xl p-4 border border-border-dark bg-surface-dark/50"
    >
      <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
        Row Count
      </p>
      <p className="text-white text-2xl font-bold leading-tight font-mono">
        {value}M <span className="text-sm font-normal text-text-muted">Rows</span>
      </p>
    </motion.div>
  );
}

function LastUpdatedCard({ time, isVisible }: { time: string; isVisible: boolean }) {
  return (
    <motion.div
      initial={isVisible ? {} : { opacity: 0, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.4 }}
      className="flex flex-col gap-1 rounded-xl p-4 border border-border-dark bg-surface-dark/50"
    >
      <p className="text-text-muted text-xs font-medium uppercase tracking-wider">
        Last Updated
      </p>
      <p className="text-white text-2xl font-bold leading-tight font-mono">
        {time} <span className="text-sm font-normal text-text-muted">ago</span>
      </p>
    </motion.div>
  );
}
