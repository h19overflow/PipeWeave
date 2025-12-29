import { motion } from 'framer-motion';
import { AlertTriangle, EyeOff, Target } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useStaggeredReveal } from '@/hooks/useScrollReveal';

const problems = [
  {
    icon: AlertTriangle,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    title: 'You train models on bad data',
    description:
      'Zip codes treated as integers. IDs fed into models. Silent failures that only surface after weeks of wasted compute.',
  },
  {
    icon: EyeOff,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    title: 'You ignore business rules',
    description:
      'COVID outliers skewing predictions. Historical anomalies polluting training sets. Constraints that never make it into the pipeline.',
  },
  {
    icon: Target,
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-400',
    title: 'You optimize for the wrong metrics',
    description:
      'Generic loss functions that produce "technically correct" but useless models. No locked success criteria before training begins.',
  },
];

export function ProblemSection() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useStaggeredReveal<HTMLDivElement>('[data-problem-card]', 100);

  return (
    <section className="w-full max-w-[1200px] px-6 py-20 md:py-28">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.p
          className="text-sm font-medium text-[var(--slate-500)] uppercase tracking-wider mb-4"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The Problem
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Traditional ML workflows are broken
        </motion.h2>
        <motion.p
          className="text-[var(--slate-400)] text-lg max-w-2xl mx-auto"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Every assumption you skip becomes a failure you pay for later.
        </motion.p>
      </div>

      {/* Problem Cards */}
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {problems.map((problem) => (
          <div
            key={problem.title}
            data-problem-card
            className="group relative bg-[var(--slate-900)]/60 border border-[var(--slate-800)] rounded-2xl p-8 hover:border-[var(--slate-700)] transition-all duration-300"
          >
            {/* Icon */}
            <div
              className={`size-14 rounded-xl ${problem.iconBg} flex items-center justify-center mb-6`}
            >
              <problem.icon className={`w-7 h-7 ${problem.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-white text-xl font-semibold mb-3">
              {problem.title}
            </h3>

            {/* Description */}
            <p className="text-[var(--slate-400)] text-sm leading-relaxed">
              {problem.description}
            </p>

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  );
}
