import { useState, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { CopilotMessage } from '@/types/pipeline-editor';

interface CopilotDrawerProps {
  messages: CopilotMessage[];
  systemLogs: string[];
  isOpen?: boolean;
  onClose?: () => void;
  onSendMessage?: (message: string) => void;
}

// TypewriterText is available for future streaming text effects
// function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) { ... }

function SystemStreamLog({ logs }: { logs: string[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-[10px] uppercase text-pe-text-secondary font-bold mb-2 tracking-wider">
        System Stream
      </p>
      <div className="font-mono text-[10px] text-pe-text-secondary space-y-1 opacity-70">
        {logs.map((log, index) => (
          <motion.p
            key={index}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className={log.includes('passed') || log.includes('True') ? 'text-green-400' : ''}
          >
            {log}
          </motion.p>
        ))}
        <motion.p
          animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-pe-primary"
        >
          &gt; stream_active_
        </motion.p>
      </div>
    </div>
  );
}

function MessageBubble({ message, index }: { message: CopilotMessage; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const bubbleRef = useRef<HTMLDivElement>(null);

  const isRecommendation = message.type === 'recommendation';

  return (
    <motion.div
      ref={bubbleRef}
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 w-full">
        <motion.div
          className={`bg-pe-surface border rounded-r-xl rounded-bl-xl p-3 shadow-sm relative overflow-hidden ${
            isRecommendation ? 'border-pe-primary/40' : 'border-pe-border'
          }`}
          whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
        >
          {/* Recommendation shimmer */}
          {isRecommendation && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-pe-primary/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <div
            className="text-sm text-pe-text-secondary leading-relaxed relative z-10"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />

          {/* Action Button */}
          {message.action && (
            <motion.button
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: 1.02,
                      boxShadow: '0 0 15px rgba(55, 19, 236, 0.4)',
                    }
              }
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              onClick={message.action.onClick}
              className="w-full py-2 mt-3 rounded border border-pe-primary/50 text-pe-primary hover:bg-pe-primary hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              {message.action.label}
            </motion.button>
          )}
        </motion.div>
        <span className="text-[10px] text-pe-text-secondary text-right">{message.timestamp}</span>
      </div>
    </motion.div>
  );
}

export function CopilotDrawer({
  messages,
  systemLogs,
  isOpen = true,
  onClose,
  onSendMessage,
}: CopilotDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const drawerVariants: Variants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          variants={prefersReducedMotion ? undefined : drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-96 border-l border-pe-border pe-glass-panel flex flex-col z-20 shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-pe-border flex items-center justify-between bg-pe-surface/50">
            <div className="flex items-center gap-3">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="size-2 rounded-full bg-pe-primary"
              />
              <h3 className="font-bold text-white text-sm">Copilot Reasoning</h3>
            </div>
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              onClick={onClose}
              className="text-pe-text-secondary hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}

            {/* System Stream */}
            <SystemStreamLog logs={systemLogs} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-pe-border bg-pe-surface/50">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Copilot to optimize..."
                className="w-full bg-[#141122] border border-pe-border rounded-lg py-2.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-pe-primary placeholder:text-pe-text-secondary/50 transition-colors"
              />
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-pe-primary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </motion.button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
