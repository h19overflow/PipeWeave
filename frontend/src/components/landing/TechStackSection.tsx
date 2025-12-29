import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Database,
  Brain,
  Server,
  Layers,
  Shield,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const techCategories = [
  {
    title: 'Backend Framework',
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    items: [
      { name: 'FastAPI', description: 'Async Python web framework' },
      { name: 'SQLAlchemy', description: 'ORM & database toolkit' },
      { name: 'PostgreSQL', description: 'Primary data store' },
      { name: 'Alembic', description: 'Database migrations' },
    ],
  },
  {
    title: 'AI / ML Stack',
    icon: Brain,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    items: [
      { name: 'LangChain', description: 'Agent orchestration' },
      { name: 'Google Gemini', description: 'LLM backbone' },
      { name: 'Scikit-learn', description: 'ML algorithms' },
      { name: 'XGBoost', description: 'Gradient boosting' },
    ],
  },
  {
    title: 'Task Processing',
    icon: Server,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    items: [
      { name: 'Celery', description: 'Distributed task queue' },
      { name: 'Redis', description: 'Cache & message broker' },
      { name: 'WebSockets', description: 'Real-time updates' },
      { name: 'Docker', description: 'Containerization' },
    ],
  },
  {
    title: 'Data Processing',
    icon: Database,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    items: [
      { name: 'Pandas', description: 'DataFrame operations' },
      { name: 'YData Profiling', description: 'Automated EDA' },
      { name: 'NumPy', description: 'Numerical computing' },
      { name: 'SHAP', description: 'Model explainability' },
    ],
  },
];

const architectureLayers = [
  { name: 'API Layer', color: 'bg-emerald-500' },
  { name: 'Services', color: 'bg-blue-500' },
  { name: 'Core Logic', color: 'bg-violet-500' },
  { name: 'Boundary', color: 'bg-amber-500' },
];

export function TechStackSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const cards = grid.querySelectorAll('[data-tech-card]');

    gsap.set(cards, { opacity: 0, scale: 0.95 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
        <div>
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--slate-800)] bg-[var(--slate-900)]/50 mb-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Layers className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-mono text-[var(--slate-400)]">
              TECHNOLOGY
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Built on Production-Grade Stack
          </motion.h2>

          <motion.p
            className="text-[var(--slate-400)] max-w-xl"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Enterprise-ready infrastructure designed for scale, reliability, and
            maintainability.
          </motion.p>
        </div>

        {/* Architecture Layers Mini-Diagram */}
        <motion.div
          className="mt-6 md:mt-0 flex items-center gap-2"
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs font-mono text-[var(--slate-500)] mr-2">
            7-Layer Architecture
          </span>
          <div className="flex gap-1">
            {architectureLayers.map((layer) => (
              <div key={layer.name} className="relative group">
                <div
                  className={`size-6 rounded ${layer.color} transition-transform group-hover:scale-110`}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--slate-900)] border border-[var(--slate-700)] rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {layer.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tech Stack Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {techCategories.map((category) => {
          const CategoryIcon = category.icon;

          return (
            <motion.div
              key={category.title}
              data-tech-card
              className={`bg-[var(--slate-900)]/50 border border-[var(--slate-800)] rounded-xl p-6 hover:border-[var(--slate-700)] transition-all group`}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : { y: -4, transition: { duration: 0.2 } }
              }
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`size-10 rounded-lg ${category.bgColor} border ${category.borderColor} flex items-center justify-center`}
                >
                  <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                </div>
                <h3 className="text-white font-bold">{category.title}</h3>
              </div>

              {/* Tech Items */}
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start gap-3 group/item"
                  >
                    <span className="size-1.5 rounded-full bg-[var(--slate-600)] mt-1.5 group-hover/item:bg-[var(--primary)] transition-colors" />
                    <div>
                      <span className="text-white text-sm font-medium block">
                        {item.name}
                      </span>
                      <span className="text-[var(--slate-500)] text-xs">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Stats Bar */}
      <motion.div
        className="mt-12 flex flex-wrap items-center justify-center gap-8 py-6 border-t border-b border-[var(--slate-800)]"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--success)]" />
          <span className="text-sm text-[var(--slate-400)]">
            Type-Safe Python
          </span>
        </div>
        <div className="h-4 w-px bg-[var(--slate-800)]" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[var(--primary)] font-bold">150</span>
          <span className="text-sm text-[var(--slate-400)]">
            Max Lines/File
          </span>
        </div>
        <div className="h-4 w-px bg-[var(--slate-800)]" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[var(--primary)] font-bold">SOLID</span>
          <span className="text-sm text-[var(--slate-400)]">
            Architecture
          </span>
        </div>
        <div className="h-4 w-px bg-[var(--slate-800)]" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[var(--primary)] font-bold">100%</span>
          <span className="text-sm text-[var(--slate-400)]">
            Type Hints
          </span>
        </div>
      </motion.div>
    </section>
  );
}
