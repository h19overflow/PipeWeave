/**
 * AgentReasoningDrawer - Right panel showing AI reasoning logs
 * Features slide-in entries, typing indicators, and chat input
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { AgentLogEntry } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface AgentReasoningDrawerProps {
  logs: AgentLogEntry[];
  isAnalyzing?: boolean;
  onSendMessage: (message: string) => void;
  className?: string;
}

const drawerVariants = {
  hidden: { x: 320, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay: 0.3 },
  },
};

const logVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#3713ec]"
          animate={prefersReducedMotion ? {} : {
            y: [0, -4, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function LogEntry({ log }: { log: AgentLogEntry }) {
  const prefersReducedMotion = useReducedMotion();
  const isActive = log.type === 'active';
  const isCompleted = log.type === 'completed';

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-lg',
        isActive && 'bg-[#3713ec]/5 border border-[#3713ec]/20',
        isCompleted && 'bg-[#1e1933] border border-[#3b3267]',
        log.type === 'system' && 'p-3'
      )}
      variants={logVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="flex items-center gap-2 mb-1">
        {isActive && (
          <motion.div
            className="w-4 h-4 rounded-full bg-[#3713ec] flex items-center justify-center"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.span
              className="material-symbols-outlined text-white text-[10px]"
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              refresh
            </motion.span>
          </motion.div>
        )}
        {isCompleted && (
          <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
        )}
        {log.type === 'system' && (
          <span className="material-symbols-outlined text-[#9b92c9] text-[16px]">terminal</span>
        )}

        <span className={cn(
          'text-xs font-bold',
          isActive && 'text-[#3713ec]',
          isCompleted && 'text-white',
          log.type === 'system' && 'font-mono text-[#9b92c9] font-normal'
        )}>
          {log.title}
        </span>
        <span className="text-[10px] text-[#9b92c9] ml-auto font-mono">{log.timestamp}</span>
      </div>

      {log.type !== 'system' && (
        <p
          className={cn(
            'text-xs leading-relaxed',
            isActive ? 'text-gray-300' : 'text-[#9b92c9]'
          )}
          dangerouslySetInnerHTML={{ __html: log.message }}
        />
      )}

      {log.type === 'system' && (
        <div className="pl-6 border-l border-[#3b3267] ml-2">
          <p className="text-[10px] font-mono text-gray-500">{log.message}</p>
        </div>
      )}

      {log.sampleData && (
        <div className="mt-2 p-2 bg-black/40 rounded border border-[#3b3267]">
          <p className="text-[10px] font-mono text-[#9b92c9]">SAMPLE VALUES:</p>
          <p className="text-xs font-mono text-white mt-1">[{log.sampleData.join(', ')}...]</p>
        </div>
      )}
    </motion.div>
  );
}

export function AgentReasoningDrawer({
  logs,
  isAnalyzing = false,
  onSendMessage,
  className,
}: AgentReasoningDrawerProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  const handleSubmit = () => {
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onSendMessage(message.trim());
    setMessage('');
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <motion.aside
      className={cn(
        'w-80 flex flex-col border-l border-[#3b3267] bg-[#141122] overflow-hidden shrink-0',
        className
      )}
      variants={drawerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="h-14 flex items-center justify-between px-5 border-b border-[#3b3267] bg-[#1e1933]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3713ec]">psychology</span>
          <h3 className="font-bold text-sm text-white">Agent Reasoning</h3>
        </div>
        <motion.button
          className="text-[#9b92c9] hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined text-[20px]">close_fullscreen</span>
        </motion.button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {isAnalyzing && <TypingIndicator />}
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-[#3b3267] bg-[#1e1933]">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-[#0f0c1d] border border-[#3b3267] rounded-lg py-2 pl-3 pr-10
                       text-sm text-white focus:outline-none focus:border-[#3713ec]
                       focus:ring-1 focus:ring-[#3713ec] placeholder-[#9b92c9]"
            placeholder="Ask AI about this schema..."
          />
          <motion.button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3713ec] hover:text-white transition-colors"
            onClick={handleSubmit}
            whileTap={{ scale: 0.85 }}
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
