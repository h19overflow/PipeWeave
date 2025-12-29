import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Terminal, PlusCircle, Sigma, Check, Loader2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type SubmitState = 'idle' | 'processing' | 'success';

interface RuleComposerProps {
  onSubmit?: (rule: string) => Promise<void>;
  className?: string;
}

export function RuleComposer({ onSubmit, className }: RuleComposerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: 'power3.out' }
    );
  }, [prefersReducedMotion]);

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || submitState !== 'idle') return;

    setSubmitState('processing');

    try {
      await onSubmit?.(value);
      setSubmitState('success');
      setTimeout(() => {
        setValue('');
        setSubmitState('idle');
      }, 1500);
    } catch {
      setSubmitState('idle');
    }
  }, [value, submitState, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section ref={containerRef} className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium text-lg flex items-center gap-2">
          <Terminal className="size-5 text-primary" />
          Rule Composer
        </h3>
        <motion.span
          animate={prefersReducedMotion ? {} : { opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20"
        >
          AI Assistant Active
        </motion.span>
      </div>

      <div className="relative group">
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-primary to-purple-600',
            'rounded-xl blur transition-opacity duration-300'
          )}
          animate={{
            opacity: isFocused ? 0.35 : 0.2,
          }}
        />

        <div className="relative bg-surface-darker border border-border-dark rounded-xl p-1 shadow-2xl">
          <div className="flex items-center px-4 py-2 border-b border-border-dark/50 bg-[#161325] rounded-t-lg gap-2">
            <TrafficLights prefersReducedMotion={prefersReducedMotion} />
            <span className="ml-4 text-xs font-mono text-text-muted">
              input.nl_query
            </span>
          </div>

          <div className="p-4 relative min-h-[120px]">
            <AnimatePresence mode="wait">
              {submitState === 'idle' && (
                <motion.div
                  key="textarea"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={`// Describe a constraint...\n> Exclude transactions where amount > $50k and region is 'APAC'...`}
                    className={cn(
                      'w-full bg-transparent border-0 text-white font-mono text-sm',
                      'focus:ring-0 focus:outline-none p-0 resize-none h-24',
                      'placeholder-text-muted/30'
                    )}
                    style={{ caretColor: '#3713ec' }}
                  />
                  {!value && isFocused && (
                    <motion.span
                      className="absolute top-0 left-0 text-primary font-mono text-sm pointer-events-none"
                      animate={prefersReducedMotion ? {} : { opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      |
                    </motion.span>
                  )}
                </motion.div>
              )}

              {submitState === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-24 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="size-8 text-primary" />
                  </motion.div>
                  <span className="ml-3 text-text-muted font-mono text-sm">
                    Processing rule...
                  </span>
                </motion.div>
              )}

              {submitState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-24 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="size-12 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <Check className="size-6 text-green-400" />
                  </motion.div>
                  <span className="ml-3 text-green-400 font-mono text-sm">
                    Rule created successfully
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center px-4 py-2 bg-[#161325] rounded-b-lg border-t border-border-dark/50">
            <div className="flex gap-2">
              <ActionButton icon={PlusCircle} label="Add Variable" />
              <ActionButton icon={Sigma} label="Insert Macro" />
            </div>
            <motion.button
              onClick={handleSubmit}
              disabled={!value.trim() || submitState !== 'idle'}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              className={cn(
                'text-xs bg-white/10 hover:bg-white/20 text-white',
                'px-3 py-1.5 rounded-md font-mono transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              ENTER
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrafficLights({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const lights = [
    { color: 'red', bg: 'bg-red-500', border: 'border-red-500' },
    { color: 'yellow', bg: 'bg-yellow-500', border: 'border-yellow-500' },
    { color: 'green', bg: 'bg-green-500', border: 'border-green-500' },
  ];

  return (
    <div className="flex gap-1.5">
      {lights.map((light) => (
        <motion.div
          key={light.color}
          className={cn(
            'size-3 rounded-full',
            `${light.bg}/20 border ${light.border}/50`
          )}
          whileHover={
            prefersReducedMotion
              ? {}
              : {
                  scale: 1.3,
                  backgroundColor:
                    light.color === 'red'
                      ? 'rgb(239, 68, 68)'
                      : light.color === 'yellow'
                        ? 'rgb(234, 179, 8)'
                        : 'rgb(34, 197, 94)',
                  boxShadow:
                    light.color === 'red'
                      ? '0 0 8px rgba(239, 68, 68, 0.6)'
                      : light.color === 'yellow'
                        ? '0 0 8px rgba(234, 179, 8, 0.6)'
                        : '0 0 8px rgba(34, 197, 94, 0.6)',
                }
          }
          transition={{ duration: 0.15 }}
        />
      ))}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className={cn(
        'text-xs text-text-muted hover:text-white flex items-center gap-1',
        'px-2 py-1 rounded transition-colors'
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </motion.button>
  );
}
