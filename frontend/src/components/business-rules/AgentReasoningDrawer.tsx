import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Bot, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  time: string;
  title?: string;
  content: string[];
  codeBlock?: string;
  status?: 'success' | 'pending' | 'processing';
  isActive?: boolean;
}

const initialLogs: LogEntry[] = [
  {
    id: '1',
    time: '14:01',
    content: ['System initialized.', 'Loading schema v4.2...'],
    status: 'success',
  },
  {
    id: '2',
    time: '14:02',
    title: 'Processing Rule #1',
    content: ['"Ignore 2020 outliers"'],
    codeBlock: `> Parsing natural language...\n> Identifying column: 'year'\n> Identifying intent: 'EXCLUDE'`,
    status: 'success',
  },
  {
    id: '3',
    time: '14:05',
    title: 'Validating Data...',
    content: ['Scanning 1.2M rows against active laws.'],
    isActive: true,
    status: 'processing',
  },
];

interface AgentReasoningDrawerProps {
  logs?: LogEntry[];
  progress?: number;
  scanned?: number;
  flagged?: number;
}

export function AgentReasoningDrawer({
  logs = initialLogs,
  progress = 65,
  scanned = 780000,
  flagged = 96700,
}: AgentReasoningDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (!drawerRef.current) return;

    gsap.fromTo(
      drawerRef.current,
      { x: 340, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.3,
        ease: 'power3.out',
        onComplete: () => setIsVisible(true),
      }
    );
  }, [prefersReducedMotion]);

  return (
    <aside
      ref={drawerRef}
      className="flex w-[340px] flex-col border-l border-border-dark bg-[#0f0c1d] shrink-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="bg-primary/20 p-1.5 rounded-lg text-primary"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="size-4" />
          </motion.div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Agent Reasoning
          </h2>
        </div>
        <StatusIndicator prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-4 bg-[#0a0814]">
        <AnimatePresence>
          {logs.map((log, index) => (
            <LogEntryComponent
              key={log.id}
              log={log}
              index={index}
              isVisible={isVisible}
              prefersReducedMotion={prefersReducedMotion}
              progress={progress}
              scanned={scanned}
              flagged={flagged}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 bg-surface-darker border-t border-border-dark">
        <motion.input
          type="text"
          placeholder="Ask agent about these rules..."
          className={cn(
            'w-full bg-surface-dark border border-border-dark rounded-lg',
            'px-3 py-2 text-xs text-white placeholder-text-muted',
            'focus:ring-1 focus:ring-primary focus:border-primary transition-all'
          )}
          whileFocus={{ scale: 1.01 }}
        />
      </div>
    </aside>
  );
}

function StatusIndicator({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="flex gap-2 items-center">
      <motion.div
        className="size-2 rounded-full bg-green-500"
        animate={prefersReducedMotion ? {} : {
          opacity: [1, 0.5, 1],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-[10px] text-green-400 font-mono">ONLINE</span>
    </div>
  );
}

interface LogEntryComponentProps {
  log: LogEntry;
  index: number;
  isVisible: boolean;
  prefersReducedMotion: boolean;
  progress: number;
  scanned: number;
  flagged: number;
}

function LogEntryComponent({
  log,
  index,
  isVisible,
  prefersReducedMotion,
  progress,
  scanned,
  flagged,
}: LogEntryComponentProps) {
  return (
    <motion.div
      initial={isVisible && !prefersReducedMotion ? { opacity: 0, x: 20 } : {}}
      animate={{ opacity: log.status === 'success' && !log.isActive ? 0.6 : 1, x: 0 }}
      transition={{ delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="flex gap-3"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center gap-1">
          <Clock className="size-2.5 text-text-muted" />
          <span className="text-text-muted text-[10px]">{log.time}</span>
        </div>
        <motion.div
          className={cn(
            'w-px flex-1 min-h-[20px]',
            log.isActive ? 'bg-gradient-to-b from-primary to-transparent' : 'bg-border-dark'
          )}
          animate={log.isActive && !prefersReducedMotion ? {
            opacity: [0.5, 1, 0.5],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        {log.isActive && (
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="size-3.5 text-primary" />
            </motion.div>
            <p className="text-white font-bold">{log.title}</p>
          </div>
        )}

        {!log.isActive && log.title && (
          <div className="flex items-center gap-2 mb-1">
            {log.status === 'success' && (
              <CheckCircle2 className="size-3.5 text-green-400" />
            )}
            <p className="text-white font-bold">{log.title}</p>
          </div>
        )}

        {log.content.map((line, i) => (
          <motion.p
            key={i}
            initial={isVisible && !prefersReducedMotion ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.15 + i * 0.05 }}
            className="text-text-muted mb-1"
          >
            {line.includes('v4.2') ? (
              <>
                Loading schema <span className="text-blue-400">v4.2</span>...
              </>
            ) : (
              line
            )}
          </motion.p>
        ))}

        {log.codeBlock && (
          <motion.div
            initial={isVisible && !prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.1 }}
            className="bg-surface-dark border border-border-dark p-2 rounded text-[10px] text-purple-300 mb-2 whitespace-pre-line"
          >
            {log.codeBlock}
          </motion.div>
        )}

        {log.status === 'success' && !log.isActive && log.codeBlock && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.15 + 0.2 }}
            className="text-green-400 flex items-center gap-1"
          >
            <CheckCircle2 className="size-3" />
            Generated SQL constraint.
          </motion.p>
        )}

        {log.isActive && (
          <ActiveProcessingBlock
            progress={progress}
            scanned={scanned}
            flagged={flagged}
            prefersReducedMotion={prefersReducedMotion}
            isVisible={isVisible}
          />
        )}
      </div>
    </motion.div>
  );
}

interface ActiveProcessingBlockProps {
  progress: number;
  scanned: number;
  flagged: number;
  prefersReducedMotion: boolean;
  isVisible: boolean;
}

function ActiveProcessingBlock({
  progress,
  scanned,
  flagged,
  prefersReducedMotion,
  isVisible,
}: ActiveProcessingBlockProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  const { value: scannedValue, start: startScanned } = useCountUp({
    end: scanned / 1000,
    duration: 2,
    decimals: 0,
    suffix: 'k',
  });

  const { value: flaggedValue, start: startFlagged } = useCountUp({
    end: flagged / 1000,
    duration: 2,
    decimals: 1,
    suffix: 'k',
  });

  useEffect(() => {
    if (!isVisible) return;

    startScanned();
    startFlagged();

    if (prefersReducedMotion || !progressRef.current) return;

    gsap.fromTo(
      progressRef.current,
      { width: '0%' },
      { width: `${progress}%`, duration: 2, ease: 'power2.out' }
    );
  }, [progress, startScanned, startFlagged, prefersReducedMotion, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Progress Bar */}
      <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden mb-2 relative">
        <motion.div
          ref={progressRef}
          className="bg-primary h-full rounded-full absolute inset-y-0 left-0"
          style={{ width: prefersReducedMotion ? `${progress}%` : '0%' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={prefersReducedMotion ? {} : { x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <motion.div
          className="bg-surface-dark p-2 rounded border border-border-dark/50"
          whileHover={{ borderColor: 'rgba(55, 19, 236, 0.3)' }}
        >
          <span className="block text-text-muted text-[10px]">Scanned</span>
          <motion.span
            className="text-white font-bold"
            key={scannedValue}
          >
            {scannedValue}
          </motion.span>
        </motion.div>
        <motion.div
          className="bg-surface-dark p-2 rounded border border-border-dark/50"
          whileHover={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}
        >
          <span className="block text-text-muted text-[10px]">Flagged</span>
          <motion.span
            className="text-yellow-400 font-bold"
            key={flaggedValue}
          >
            {flaggedValue}
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
