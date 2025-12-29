import { motion } from 'framer-motion';
import {
  Clock,
  ShieldAlert,
  Lock,
  MousePointerClick,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollReveal, useStaggeredReveal } from '@/hooks/useScrollReveal';

const benefits = [
  {
    icon: Clock,
    title: '10-Minute Setup',
    description: 'From CSV upload to validated schema in minutes. No configuration files. No deployment headaches.',
  },
  {
    icon: ShieldAlert,
    title: 'Zero Silent Failures',
    description: 'Every assumption is validated upfront. Integer traps caught. Business rules enforced. No surprises.',
  },
  {
    icon: Lock,
    title: 'Business Rule Enforcement',
    description: 'Define constraints that models cannot break. Lock in domain knowledge before training begins.',
  },
  {
    icon: MousePointerClick,
    title: 'Visual Pipeline Builder',
    description: 'Drag-and-drop interface for building ML pipelines. No code required. Full transparency.',
  },
  {
    icon: Scissors,
    title: 'Surgical Swapping',
    description: 'Change one component, only that path recalculates. No full pipeline reruns. Save hours of compute.',
  },
  {
    icon: Sparkles,
    title: 'AI Copilot',
    description: 'Intelligent suggestions at every step. Context-aware recommendations based on your data and goals.',
  },
];

export function BenefitsGrid() {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useStaggeredReveal<HTMLDivElement>('[data-benefit-card]', 80);

  return (
    <section className="w-full max-w-[1200px] px-6 py-20 md:py-28">
      {/* Section Header */}
      <div ref={headerRef} className="text-center mb-16">
        <p className="text-sm font-medium text-[var(--primary)] uppercase tracking-wider mb-4">
          Benefits
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Why teams choose MLE Workbench
        </h2>
        <p className="text-[var(--slate-400)] text-lg max-w-2xl mx-auto">
          Everything you need to build reliable ML pipelines. Nothing you don't.
        </p>
      </div>

      {/* Benefits Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <motion.div
            key={benefit.title}
            data-benefit-card
            className="group relative bg-[var(--slate-900)]/40 border border-[var(--slate-800)] rounded-2xl p-6 hover:border-[var(--slate-700)] transition-all duration-300"
            whileHover={prefersReducedMotion ? {} : { y: -4 }}
          >
            {/* Icon */}
            <div className="size-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-5 group-hover:bg-[var(--primary)]/15 transition-colors">
              <benefit.icon className="w-6 h-6 text-[var(--primary)]" />
            </div>

            {/* Title */}
            <h3 className="text-white text-lg font-semibold mb-2">
              {benefit.title}
            </h3>

            {/* Description */}
            <p className="text-[var(--slate-400)] text-sm leading-relaxed">
              {benefit.description}
            </p>

            {/* Hover gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
