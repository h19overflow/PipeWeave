import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Table2, FileCode, Workflow, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const screens = [
  {
    id: 'schema',
    icon: Table2,
    title: 'Schema Deduction',
    caption: 'AI-powered column type detection with confidence scores',
    mockContent: 'schema',
  },
  {
    id: 'rules',
    icon: FileCode,
    title: 'Business Rules',
    caption: 'Inject immutable constraints that models cannot ignore',
    mockContent: 'rules',
  },
  {
    id: 'pipeline',
    icon: Workflow,
    title: 'Pipeline Editor',
    caption: 'Visual DAG builder with surgical component swapping',
    mockContent: 'pipeline',
  },
];

export function ProductShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const scrollAmount = scrollerRef.current.clientWidth * 0.8;
    scrollerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full py-20 md:py-28 overflow-hidden">
      {/* Section Header */}
      <div ref={headerRef} className="max-w-[1200px] mx-auto px-6 text-center mb-12">
        <p className="text-sm font-medium text-[var(--primary)] uppercase tracking-wider mb-4">
          Product
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          See it in action
        </h2>
        <p className="text-[var(--slate-400)] text-lg max-w-2xl mx-auto">
          Every screen designed for clarity. Every interaction optimized for speed.
        </p>
      </div>

      {/* Horizontal scroll container with snap */}
      <div className="relative">
        {/* Navigation arrows - desktop only */}
        <div className="hidden lg:flex absolute inset-y-0 left-4 z-10 items-center">
          <button
            onClick={() => scroll('left')}
            className="size-12 rounded-full bg-[var(--slate-900)]/90 border border-[var(--slate-800)] flex items-center justify-center text-[var(--slate-400)] hover:text-white hover:border-[var(--slate-700)] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="hidden lg:flex absolute inset-y-0 right-4 z-10 items-center">
          <button
            onClick={() => scroll('right')}
            className="size-12 rounded-full bg-[var(--slate-900)]/90 border border-[var(--slate-800)] flex items-center justify-center text-[var(--slate-400)] hover:text-white hover:border-[var(--slate-700)] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable container */}
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 lg:px-[calc((100vw-1200px)/2+24px)] pb-4 hide-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {screens.map((screen, index) => (
            <motion.div
              key={screen.id}
              className="flex-shrink-0 w-[85vw] max-w-[900px] snap-center"
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Card */}
              <div className="bg-[var(--slate-900)]/60 border border-[var(--slate-800)] rounded-2xl overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center gap-3 p-4 border-b border-[var(--slate-800)]">
                  <div className="size-10 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                    <screen.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{screen.title}</h3>
                    <p className="text-[var(--slate-500)] text-sm">{screen.caption}</p>
                  </div>
                </div>

                {/* Mock Screen Content */}
                <div className="aspect-[16/10] p-4 bg-[var(--obsidian)]/50">
                  <ScreenMock type={screen.mockContent} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-2 mt-6">
          {screens.map((screen) => (
            <div
              key={screen.id}
              className="size-2 rounded-full bg-[var(--slate-700)]"
            />
          ))}
        </div>
      </div>

      {/* Hide scrollbar utility */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

function ScreenMock({ type }: { type: string }) {
  if (type === 'schema') {
    return (
      <div className="h-full rounded-lg bg-[var(--slate-900)]/80 border border-[var(--slate-800)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Schema Analysis</div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs text-[var(--slate-500)]">18 columns analyzed</span>
          </div>
        </div>
        <div className="space-y-2">
          {['user_age', 'email', 'zip_code', 'tx_amount'].map((col, i) => (
            <div key={col} className="flex items-center justify-between py-2 px-3 bg-[var(--slate-800)]/50 rounded text-sm">
              <span className="text-[var(--slate-300)] font-mono">{col}</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${i === 2 ? 'text-[var(--warning)]' : 'text-[var(--primary)]'}`}>
                  {i === 2 ? 'Category (94%)' : i === 0 ? 'Integer' : i === 1 ? 'Email' : 'Float'}
                </span>
                <span className={`size-2 rounded-full ${i === 2 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'rules') {
    return (
      <div className="h-full rounded-lg bg-[var(--slate-900)]/80 border border-[var(--slate-800)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Business Rules</div>
          <div className="px-2 py-1 bg-[var(--primary)]/20 rounded text-xs text-[var(--primary)]">
            3 Active
          </div>
        </div>
        <div className="space-y-3 font-mono text-sm">
          <div className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded">
            <div className="text-[var(--success)] text-xs mb-1">EXCLUDE</div>
            <div className="text-white">year == 2020</div>
          </div>
          <div className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded">
            <div className="text-[var(--success)] text-xs mb-1">REQUIRE</div>
            <div className="text-white">user_id IS NOT NULL</div>
          </div>
          <div className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded">
            <div className="text-[var(--success)] text-xs mb-1">BOUND</div>
            <div className="text-white">tx_amount BETWEEN 0 AND 10000</div>
          </div>
        </div>
      </div>
    );
  }

  // Pipeline
  return (
    <div className="h-full rounded-lg bg-[var(--slate-900)]/80 border border-[var(--slate-800)] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-semibold">Pipeline Canvas</div>
        <button className="px-3 py-1 bg-[var(--primary)] rounded text-white text-xs">
          Run Pipeline
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 mt-8">
        {/* Simple pipeline visualization */}
        <div className="px-4 py-2 bg-[var(--slate-800)] rounded text-[var(--slate-300)] text-xs">
          Data Input
        </div>
        <div className="w-8 h-px bg-[var(--slate-700)]" />
        <div className="px-4 py-2 bg-[var(--primary)]/20 border border-[var(--primary)] rounded text-white text-xs">
          MinMaxScaler
        </div>
        <div className="w-8 h-px bg-[var(--slate-700)]" />
        <div className="px-4 py-2 bg-[var(--slate-800)] rounded text-[var(--slate-300)] text-xs">
          XGBoost
        </div>
      </div>
      <div className="text-center mt-8 text-xs text-[var(--slate-500)]">
        Drag components to build your pipeline
      </div>
    </div>
  );
}
