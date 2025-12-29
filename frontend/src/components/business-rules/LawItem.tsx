import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Filter, ShieldCheck, Ban, Code, MinusCircle, Pencil } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export type LawType = 'filter' | 'enforce' | 'block';
export type TagType = 'manual' | 'system';

export interface LawItemData {
  id: string;
  title: string;
  code: string;
  filterPercent?: string;
  type: LawType;
  tag: TagType;
  enabled: boolean;
}

interface LawItemProps {
  law: LawItemData;
  index: number;
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
}

const lawIcons: Record<LawType, React.ComponentType<{ className?: string }>> = {
  filter: Filter,
  enforce: ShieldCheck,
  block: Ban,
};

const iconColors: Record<LawType, { active: string; inactive: string }> = {
  filter: { active: 'bg-primary/10 text-primary', inactive: 'bg-slate-700/20 text-text-muted' },
  enforce: { active: 'bg-emerald-500/10 text-emerald-400', inactive: 'bg-slate-700/20 text-text-muted' },
  block: { active: 'bg-slate-700/20 text-text-muted', inactive: 'bg-slate-700/20 text-text-muted' },
};

const tagColors: Record<TagType, string> = {
  manual: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  system: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export function LawItem({ law, index, onToggle, onEdit }: LawItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const itemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const Icon = lawIcons[law.type];

  useEffect(() => {
    if (prefersReducedMotion || !itemRef.current) return;

    gsap.fromTo(
      itemRef.current,
      { opacity: 0, y: 20, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        delay: 0.5 + index * 0.1,
        ease: 'power2.out',
      }
    );
  }, [index, prefersReducedMotion]);

  return (
    <motion.div
      ref={itemRef}
      className={cn(
        'bg-surface-dark border rounded-xl p-4 flex items-center justify-between',
        'group transition-all shadow-sm relative overflow-hidden',
        law.enabled
          ? 'border-border-dark'
          : 'border-border-dark/50 bg-surface-dark/40 opacity-75'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      animate={{
        borderColor: isHovered && law.enabled ? 'rgba(55, 19, 236, 0.5)' : undefined,
        opacity: law.enabled ? 1 : 0.75,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Hover Glow Effect */}
      <AnimatePresence>
        {isHovered && law.enabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Left Content */}
      <div className="flex items-start gap-4 relative z-10">
        {/* Icon */}
        <motion.div
          className={cn(
            'mt-1 p-2 rounded-lg transition-colors duration-300',
            law.enabled ? iconColors[law.type].active : iconColors[law.type].inactive
          )}
          animate={{
            filter: law.enabled ? 'grayscale(0%)' : 'grayscale(100%)',
            scale: law.enabled ? 1 : 0.95,
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="size-5" />
        </motion.div>

        {/* Text Content */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-white font-medium"
              animate={{
                color: law.enabled ? '#ffffff' : '#9b92c9',
                textDecoration: law.enabled ? 'none' : 'line-through',
              }}
              transition={{ duration: 0.3 }}
            >
              {law.title}
            </motion.span>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                tagColors[law.tag]
              )}
            >
              {law.tag}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <Code className="size-3" />
              {law.code}
            </span>
            <AnimatePresence>
              {law.filterPercent && law.enabled && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1 text-red-400"
                >
                  <MinusCircle className="size-3" />
                  Filters {law.filterPercent} rows
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 relative z-10">
        {/* Edit Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => onEdit?.(law.id)}
              className="text-text-muted hover:text-white p-2 rounded-lg hover:bg-white/5"
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
            >
              <Pencil className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Toggle Switch */}
        <ToggleSwitch
          enabled={law.enabled}
          onToggle={() => onToggle(law.id)}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </motion.div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  prefersReducedMotion: boolean;
}

function ToggleSwitch({ enabled, onToggle, prefersReducedMotion }: ToggleSwitchProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'w-11 h-6 rounded-full relative transition-colors duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-dark'
      )}
      animate={{
        backgroundColor: enabled ? '#3713ec' : '#475569',
        boxShadow: enabled ? '0 0 10px rgba(55, 19, 236, 0.5)' : 'none',
      }}
      transition={{ duration: 0.3 }}
      role="switch"
      aria-checked={enabled}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
    >
      <span className="sr-only">Toggle rule</span>
      <motion.span
        className="absolute top-1 left-0.5 size-4 rounded-full"
        animate={{
          x: enabled ? 22 : 2,
          backgroundColor: enabled ? '#ffffff' : '#94a3b8',
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 500, damping: 30 }
        }
      />
    </motion.button>
  );
}
