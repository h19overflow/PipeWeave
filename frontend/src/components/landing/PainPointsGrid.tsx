import { motion, type Variants } from 'framer-motion';
import { AlertTriangle, EyeOff, Radar, XCircle, Clock, Ban } from 'lucide-react';
import { useStaggerReveal } from '@/hooks/useScrollAnimation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const painPoints = [
  {
    icon: AlertTriangle,
    iconColor: 'text-[var(--warning)]',
    title: 'The Silent Failure',
    description:
      'Models treating Zip Codes as continuous integers instead of categorical data, skewing distance metrics silently.',
    code: 'Zip Codes',
    statusIcon: XCircle,
    statusColor: 'text-[var(--danger)]',
    statusText: 'Drift Detected: +14%',
  },
  {
    icon: EyeOff,
    iconColor: 'text-[var(--slate-200)]',
    title: 'The Rule Blindness',
    description:
      "Agents ignoring historical anomalies or business constraints because they weren't explicitly vectorized in the embedding space.",
    code: null,
    statusIcon: Clock,
    statusColor: 'text-[var(--warning)]',
    statusText: 'Constraint Violation',
  },
  {
    icon: Radar,
    iconColor: 'text-[var(--slate-200)]',
    title: 'The Vague Objective',
    description:
      'Models optimized for generic loss functions without locked business success metrics, leading to "technically correct" but useless outputs.',
    code: null,
    statusIcon: Ban,
    statusColor: 'text-[var(--slate-500)]',
    statusText: 'Optimization: Unbounded',
  },
];

const cardVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '4px 4px 0px 0px var(--slate-800)',
    borderColor: 'var(--slate-800)',
  },
  hover: {
    y: -4,
    boxShadow: '4px 4px 0px 0px var(--primary-dark)',
    borderColor: 'rgba(90, 92, 242, 0.5)',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

export function PainPointsGrid() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useStaggerReveal<HTMLDivElement>('[data-card]', 0.15);

  return (
    <section className="w-full max-w-[1280px] px-6 py-12">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white">
          Pain Points of Baseline Modeling
        </h2>
        <div className="h-px flex-1 bg-[var(--slate-800)]" />
      </div>

      {/* Cards Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {painPoints.map((point) => (
          <motion.div
            key={point.title}
            data-card
            variants={prefersReducedMotion ? undefined : cardVariants}
            initial="rest"
            whileHover="hover"
            className="group bg-[var(--slate-900)] border border-[var(--slate-800)] p-6 rounded-lg shadow-hard transition-colors"
          >
            {/* Icon */}
            <motion.div
              className="h-12 w-12 bg-[var(--slate-800)] rounded flex items-center justify-center mb-6 group-hover:bg-[var(--primary)]/20 transition-colors"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            >
              <point.icon className={`w-7 h-7 ${point.iconColor}`} />
            </motion.div>

            {/* Title */}
            <h3 className="text-white text-xl font-bold mb-3">{point.title}</h3>

            {/* Description */}
            <p className="text-[var(--slate-400)] text-sm leading-relaxed mb-4">
              {point.code && (
                <span className="font-mono text-[var(--slate-300)] bg-[var(--slate-800)] px-1 rounded">
                  {point.code}
                </span>
              )}{' '}
              {point.description.replace(point.code || '', '')}
            </p>

            {/* Status */}
            <div
              className={`flex items-center gap-2 text-xs font-mono ${point.statusColor}`}
            >
              <point.statusIcon className="w-3.5 h-3.5" />
              <span>{point.statusText}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
