import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function HeroSectionNew() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="w-full max-w-[1200px] px-6 pt-20 pb-24 md:pt-28 md:pb-32 flex flex-col items-center text-center">
      <motion.div
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--slate-700)] bg-[var(--slate-900)]/60 mb-8"
        >
          <span className="size-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-xs font-medium text-[var(--slate-300)]">
            Now in Public Beta
          </span>
        </motion.div>

        {/* Main Headline - Value focused */}
        <motion.h1
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl"
        >
          Stop Guessing.
          <br />
          <span className="text-gradient">Start Knowing.</span>
        </motion.h1>

        {/* Subheadline - Clear value proposition */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="text-[var(--slate-400)] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
        >
          The ML workbench that{' '}
          <span className="text-white font-medium">validates your data</span>{' '}
          before wasting compute. No more silent failures. No more wasted cycles.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Primary CTA */}
          <Link to="/schema">
            <motion.button
              className="group flex items-center gap-3 bg-[var(--primary)] hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-glow"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>

          {/* Secondary CTA */}
          <motion.button
            className="group flex items-center gap-3 bg-transparent border border-[var(--slate-700)] hover:border-[var(--slate-600)] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-[var(--slate-900)]"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            <Play className="w-5 h-5" />
            <span>Watch Demo</span>
          </motion.button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--slate-500)]"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white">10 min</span>
            <span>setup</span>
          </div>
          <div className="w-px h-4 bg-[var(--slate-800)]" />
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white">Zero</span>
            <span>silent failures</span>
          </div>
          <div className="w-px h-4 bg-[var(--slate-800)]" />
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white">Free</span>
            <span>to start</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Hero Visual Placeholder - Product mockup would go here */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-16 w-full max-w-4xl"
      >
        <div className="relative rounded-xl border border-[var(--slate-800)] bg-[var(--slate-900)]/50 p-4 overflow-hidden shadow-2xl">
          {/* Mock browser chrome */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--slate-800)]">
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[var(--danger)]/70" />
              <span className="size-3 rounded-full bg-[var(--warning)]/70" />
              <span className="size-3 rounded-full bg-[var(--success)]/70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-lg bg-[var(--slate-800)] text-xs text-[var(--slate-400)] font-mono">
                app.mleworkbench.io/schema
              </div>
            </div>
          </div>

          {/* Mock interface preview */}
          <div className="aspect-video bg-gradient-to-br from-[var(--slate-900)] to-[var(--obsidian)] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)] shadow-glow" />
              </div>
              <p className="text-[var(--slate-500)] text-sm">
                Product preview coming soon
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
