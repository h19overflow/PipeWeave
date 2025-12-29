import { useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { gsap } from 'gsap';
import { Terminal } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0 0)',
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 25px rgba(90, 92, 242, 0.5)',
  },
  tap: { scale: 0.98 },
};

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const gradientRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !gradientRef.current) return;

    // Subtle gradient shimmer effect
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(gradientRef.current, {
      backgroundPosition: '200% center',
      duration: 3,
      ease: 'power1.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <section className="w-full max-w-[1280px] px-6 py-20 md:py-32 flex flex-col items-center text-center">
      <motion.div
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--slate-800)] bg-[var(--slate-900)]/50 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="text-xs font-mono text-[var(--primary)] uppercase tracking-wide">
            Context-First Engineering
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl"
        >
          Stop Paying the <br />
          <span
            ref={gradientRef}
            className="text-gradient"
            style={{
              backgroundSize: '200% auto',
            }}
          >
            Assumption Tax.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="text-[var(--slate-400)] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
        >
          Validate before you vectorize. Our{' '}
          <span className="text-white font-medium">Context-First methodology</span>{' '}
          prevents silent failures by locking constraints before a single tensor is
          calculated.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          variants={prefersReducedMotion ? undefined : buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          className="group relative flex items-center gap-3 bg-[var(--primary)] hover:bg-indigo-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-glow"
        >
          <Terminal className="w-5 h-5" />
          <span>Initialize Context</span>
          <span className="bg-indigo-900/50 text-indigo-200 text-xs font-mono py-0.5 px-2 rounded ml-2 border border-indigo-700">
            10-Min Setup
          </span>
        </motion.button>

        {/* Terminal Command */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-6 text-[var(--slate-600)] text-sm font-mono"
        >
          <span className="text-[var(--primary)]">&gt;_</span> sudo mle-init --strict-mode
        </motion.p>
      </motion.div>
    </section>
  );
}
