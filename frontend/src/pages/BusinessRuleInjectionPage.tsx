import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { History, Play, Home, ChevronRight } from 'lucide-react';
import { ContextPanel } from '@/components/business-rules/ContextPanel';
import { RuleComposer } from '@/components/business-rules/RuleComposer';
import { ActiveLawsList } from '@/components/business-rules/ActiveLawsList';
import { ImpactChart } from '@/components/business-rules/ImpactChart';
import { AgentReasoningDrawer } from '@/components/business-rules/AgentReasoningDrawer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export function BusinessRuleInjectionPage() {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Header animation
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
      );
    }

    // Content sections stagger
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll('section');
      gsap.fromTo(
        sections,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.3,
          ease: 'power2.out',
        }
      );
    }
  }, [prefersReducedMotion]);

  const handleRuleSubmit = useCallback(async (rule: string) => {
    console.log('Submitting rule:', rule);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, []);

  const handleRunSimulation = useCallback(async () => {
    setIsSimulating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsSimulating(false);
  }, []);

  return (
    <div className="flex h-full w-full flex-row bg-[#0a0a0f] text-white font-display overflow-hidden selection:bg-primary selection:text-white">
      {/* Context Panel */}
      <ContextPanel />

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col relative bg-surface-dark/30 overflow-hidden">
        {/* Header */}
        <header
          ref={headerRef}
          className="flex flex-col border-b border-border-dark bg-background-dark/80 backdrop-blur-md z-10"
        >
          <div className="px-8 pt-6 pb-2">
            {/* Breadcrumbs */}
            <Breadcrumbs prefersReducedMotion={prefersReducedMotion} />

            {/* Title Row */}
            <div className="flex flex-wrap justify-between items-end gap-4 pb-4">
              <div className="flex flex-col gap-1">
                <motion.h1
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white text-3xl font-bold tracking-tight"
                >
                  Business Rule Injection
                </motion.h1>
                <motion.p
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-text-muted text-sm max-w-2xl"
                >
                  Translate natural language constraints into active data governance laws.
                </motion.p>
              </div>
              <HeaderActions
                prefersReducedMotion={prefersReducedMotion}
                isSimulating={isSimulating}
                onRunSimulation={handleRunSimulation}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <RuleComposer onSubmit={handleRuleSubmit} />
            <ActiveLawsList />
            <ImpactChart />
          </div>
        </div>
      </main>

      {/* Agent Reasoning Drawer */}
      <AgentReasoningDrawer />
    </div>
  );
}

interface BreadcrumbsProps {
  prefersReducedMotion: boolean;
}

function Breadcrumbs({ prefersReducedMotion }: BreadcrumbsProps) {
  const crumbs = [
    { label: 'Home', href: '#', icon: Home },
    { label: 'Model V2', href: '#' },
    { label: 'Business Rules', href: '#', active: true },
  ];

  return (
    <nav className="flex flex-wrap gap-2 items-center text-sm mb-4">
      {crumbs.map((crumb, index) => (
        <motion.span
          key={crumb.label}
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          className="flex items-center gap-2"
        >
          {index > 0 && <ChevronRight className="size-3 text-text-muted" />}
          {crumb.active ? (
            <span className="text-primary font-medium">{crumb.label}</span>
          ) : (
            <a
              href={crumb.href}
              className="text-text-muted hover:text-white transition-colors flex items-center gap-1"
            >
              {crumb.icon && <crumb.icon className="size-3" />}
              {crumb.label}
            </a>
          )}
        </motion.span>
      ))}
    </nav>
  );
}

interface HeaderActionsProps {
  prefersReducedMotion: boolean;
  isSimulating: boolean;
  onRunSimulation: () => void;
}

function HeaderActions({ prefersReducedMotion, isSimulating, onRunSimulation }: HeaderActionsProps) {
  return (
    <div className="flex gap-3">
      <motion.button
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border border-border-dark',
          'text-text-muted hover:text-white hover:bg-surface-dark transition-colors',
          'text-sm font-bold'
        )}
      >
        <History className="size-4" />
        History
      </motion.button>

      <motion.button
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        whileHover={
          prefersReducedMotion
            ? {}
            : { scale: 1.02, boxShadow: '0 0 25px rgba(55, 19, 236, 0.4)' }
        }
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        onClick={onRunSimulation}
        disabled={isSimulating}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-primary hover:bg-primary/90 text-white text-sm font-bold',
          'shadow-lg shadow-primary/25 transition-all',
          'disabled:opacity-70 disabled:cursor-not-allowed'
        )}
      >
        {isSimulating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="size-5"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </motion.div>
            Running...
          </>
        ) : (
          <>
            <Play className="size-5" />
            Run Simulation
          </>
        )}
      </motion.button>
    </div>
  );
}
