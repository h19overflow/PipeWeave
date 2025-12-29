import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart3,
  MessageSquareText,
  Workflow,
  Cpu,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const workflowStages = [
  {
    number: '01',
    icon: BarChart3,
    title: 'EDA Analysis',
    description: 'Exploratory Data Analysis with automated profiling and statistical summaries.',
    features: ['Distribution Analysis', 'Correlation Matrix', 'Missing Value Detection'],
    color: 'from-blue-500 to-indigo-500',
  },
  {
    number: '02',
    icon: MessageSquareText,
    title: 'Context Gathering',
    description: 'RAG-powered domain understanding through intelligent questioning.',
    features: ['Business Objectives', 'Domain Constraints', 'Anomaly Identification'],
    color: 'from-indigo-500 to-violet-500',
  },
  {
    number: '03',
    icon: Workflow,
    title: 'Pipeline Construction',
    description: 'Visual DAG builder with drag-drop components and surgical swapping.',
    features: ['Node Library', 'Auto-Validation', 'Dependency Graph'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    number: '04',
    icon: Cpu,
    title: 'Model Training',
    description: 'Distributed execution with Celery workers and real-time progress.',
    features: ['Hyperparameter Tuning', 'Cross-Validation', 'Early Stopping'],
    color: 'from-purple-500 to-fuchsia-500',
  },
  {
    number: '05',
    icon: LineChart,
    title: 'Evaluation',
    description: 'Comprehensive metrics analysis with SHAP feature importance.',
    features: ['Performance Metrics', 'Feature Importance', 'Model Comparison'],
    color: 'from-fuchsia-500 to-pink-500',
  },
];

export function ArchitectureSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const cards = cardsRef.current;
    if (!section || !cards) return;

    const cardElements = cards.querySelectorAll('[data-stage-card]');

    gsap.set(cardElements, { opacity: 0, y: 60 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(cardElements, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full max-w-[1280px] px-6 py-24 relative"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--slate-800)] bg-[var(--slate-900)]/50 mb-6"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Workflow className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-mono text-[var(--slate-300)]">
            5-Stage Pipeline
          </span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Architecture Showcase
        </motion.h2>

        <motion.p
          className="text-[var(--slate-400)] text-lg max-w-2xl mx-auto"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          From raw data to deployed model in five structured stages, each with
          built-in validation gates.
        </motion.p>
      </div>

      {/* Workflow Stages Grid */}
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {workflowStages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isLast = index === workflowStages.length - 1;

          return (
            <div key={stage.number} className="relative" data-stage-card>
              {/* Connector Arrow (hidden on last and mobile) */}
              {!isLast && (
                <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-[var(--slate-700)]" />
                </div>
              )}

              <motion.div
                className="h-full bg-[var(--slate-900)]/50 border border-[var(--slate-800)] rounded-xl p-6 hover:border-[var(--primary)]/50 transition-all group"
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        y: -4,
                        boxShadow: '0 10px 40px rgba(90, 92, 242, 0.15)',
                      }
                }
              >
                {/* Stage Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[var(--slate-600)]">
                    STAGE {stage.number}
                  </span>
                  <div
                    className={`size-8 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}
                  >
                    <StageIcon className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2">
                  {stage.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--slate-400)] text-sm mb-4 leading-relaxed">
                  {stage.description}
                </p>

                {/* Features */}
                <ul className="space-y-1.5">
                  {stage.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-[var(--slate-500)]"
                    >
                      <span className="size-1 rounded-full bg-[var(--primary)]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Bottom Flow Visualization */}
      <motion.div
        className="mt-12 flex items-center justify-center"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-[var(--slate-900)] border border-[var(--slate-800)] rounded-full">
          <span className="size-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-sm font-mono text-[var(--slate-400)]">
            Data In
          </span>
          <div className="w-16 h-px bg-gradient-to-r from-[var(--slate-700)] to-[var(--primary)]" />
          <span className="text-sm font-mono text-[var(--primary)]">
            5 Stages
          </span>
          <div className="w-16 h-px bg-gradient-to-r from-[var(--primary)] to-[var(--success)]" />
          <span className="text-sm font-mono text-[var(--slate-400)]">
            Model Out
          </span>
          <span className="size-2 rounded-full bg-[var(--success)] animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}
