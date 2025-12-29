import { motion } from 'framer-motion';
import { Upload, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload & Validate',
    description: 'We analyze your data and flag issues before you waste time. Schema deduction catches silent failures instantly.',
    features: [
      'Automatic type detection',
      'Integer trap detection (IDs, Zip codes)',
      'Missing value analysis',
    ],
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Inject Rules',
    description: 'Define business constraints that models cannot break. Lock in domain knowledge before a single tensor is calculated.',
    features: [
      'Exclude historical anomalies',
      'Set value bounds',
      'Define must-pass conditions',
    ],
  },
  {
    number: '03',
    icon: Zap,
    title: 'Train with Confidence',
    description: 'One-click training with locked success metrics. Change components surgically - only affected paths recalculate.',
    features: [
      'Visual pipeline builder',
      'Surgical component swapping',
      'Real-time progress tracking',
    ],
  },
];

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useScrollReveal<HTMLDivElement>();

  return (
    <section className="w-full max-w-[1200px] px-6 py-20 md:py-28">
      {/* Section Header */}
      <div ref={headerRef} className="text-center mb-16 lg:mb-20">
        <p className="text-sm font-medium text-[var(--primary)] uppercase tracking-wider mb-4">
          How It Works
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Three steps to reliable ML pipelines
        </h2>
        <p className="text-[var(--slate-400)] text-lg max-w-2xl mx-auto">
          Stop paying the assumption tax. Validate before you vectorize.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 lg:space-y-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* Content - alternates position on desktop */}
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              {/* Step Number */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl font-bold text-[var(--slate-800)] font-mono">
                  {step.number}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[var(--slate-800)] to-transparent" />
              </div>

              {/* Icon + Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-[var(--slate-400)] text-lg mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Feature List */}
              <ul className="space-y-3">
                {step.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[var(--slate-300)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <div className="relative aspect-[4/3] rounded-2xl border border-[var(--slate-800)] bg-[var(--slate-900)]/50 overflow-hidden">
                {/* Mock interface visualization */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <StepVisualization step={index} />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--obsidian)] via-transparent to-transparent opacity-30" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function StepVisualization({ step }: { step: number }) {
  if (step === 0) {
    // Upload & Validate visualization
    return (
      <div className="w-full max-w-sm space-y-3">
        <div className="bg-[var(--slate-800)] rounded-lg p-3 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--slate-400)]">customer_data.csv</span>
            <span className="text-[var(--success)]">Analyzing...</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--slate-500)]">user_age</span>
              <span className="text-[var(--success)]">int64 - OK</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--slate-500)]">zip_code</span>
              <span className="text-[var(--warning)]">int64 - FLAG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--slate-500)]">user_id</span>
              <span className="text-[var(--warning)]">int64 - FLAG</span>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-[var(--slate-500)]">
          2 integer traps detected
        </div>
      </div>
    );
  }

  if (step === 1) {
    // Rule Injection visualization
    return (
      <div className="w-full max-w-sm space-y-2 font-mono text-xs">
        <div className="bg-[var(--slate-800)] rounded-lg p-3">
          <div className="text-[var(--slate-500)] mb-2"># Business Rules</div>
          <div className="space-y-1">
            <div className="text-[var(--success)]">+ WHERE year != 2020</div>
            <div className="text-[var(--success)]">+ user_id IS NOT NULL</div>
            <div className="text-[var(--success)]">+ tx_amount BETWEEN 0 AND 10000</div>
          </div>
          <div className="mt-3 pt-2 border-t border-[var(--slate-700)] text-[var(--primary)]">
            3 laws injected
          </div>
        </div>
      </div>
    );
  }

  // Train visualization
  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="bg-[var(--slate-800)] rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-sm">Training</span>
          <span className="text-[var(--success)] text-xs font-mono">Epoch 47/50</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--slate-900)] p-2 rounded">
            <div className="text-[var(--slate-500)] text-[10px] mb-1">F1-Score</div>
            <div className="text-white text-lg font-bold">0.87</div>
          </div>
          <div className="bg-[var(--slate-900)] p-2 rounded">
            <div className="text-[var(--slate-500)] text-[10px] mb-1">RMSE</div>
            <div className="text-white text-lg font-bold">0.12</div>
          </div>
        </div>
      </div>
    </div>
  );
}
