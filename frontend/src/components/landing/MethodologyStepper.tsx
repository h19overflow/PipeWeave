import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CheckSquare,
  Square,
  Upload,
  Table2,
  Sparkles,
  FileCode,
  MessageSquare,
  GitBranch,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const methodologySteps = [
  {
    time: 'MIN 0-1',
    title: 'Data Ingestion',
    description:
      'Upload your dataset. We handle CSVs up to 10GB with automatic chunking and validation.',
    content: 'upload',
    icon: Upload,
  },
  {
    time: 'MIN 1-3',
    title: 'The Silent Scan',
    description:
      'Automated schema deduction. We flag potential "integer traps" like Zip Codes or IDs immediately.',
    content: 'table',
    icon: Table2,
  },
  {
    time: 'MIN 3-4',
    title: 'AI Type Deduction',
    description:
      'Our AI agent analyzes each column, providing confidence scores and recommendations.',
    content: 'confidence',
    icon: Sparkles,
  },
  {
    time: 'MIN 4-6',
    title: 'Rule Injection',
    description:
      'Inject immutable business laws. Agents cannot hallucinate past these hard constraints.',
    content: 'terminal',
    icon: FileCode,
  },
  {
    time: 'MIN 6-7',
    title: 'Domain Context',
    description:
      'RAG-powered context gathering. We understand your domain before suggesting pipelines.',
    content: 'chat',
    icon: MessageSquare,
  },
  {
    time: 'MIN 7-8',
    title: 'Surgical Swapping',
    description:
      'Build pipelines visually. Swap components surgically - only affected paths recalculate.',
    content: 'pipeline',
    icon: GitBranch,
  },
  {
    time: 'MIN 8-9',
    title: 'Readiness Check',
    description:
      'Final gateway. Models cannot be trained until success metrics are locked and approved.',
    content: 'checklist',
    icon: ShieldCheck,
  },
  {
    time: 'MIN 9-10',
    title: 'Model Training',
    description:
      'One-click training with real-time progress. Celery-powered distributed execution.',
    content: 'metrics',
    icon: Zap,
  },
];

function UploadView() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-xs shadow-inner min-h-[140px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center border border-[var(--primary)]/30">
          <Upload className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <div className="text-white font-bold">customer_data.csv</div>
          <div className="text-[var(--slate-500)]">Uploading...</div>
        </div>
      </div>
      <div className="w-full bg-[var(--slate-800)] rounded-full h-2 mb-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[var(--primary)] to-indigo-400 rounded-full w-[78%] animate-pulse" />
      </div>
      <div className="flex justify-between text-[var(--slate-400)]">
        <span>45,201 rows | 18 columns</span>
        <span className="text-[var(--primary)]">12.4 MB</span>
      </div>
    </div>
  );
}

function DataTable() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-1 overflow-hidden font-mono text-[10px] select-none shadow-inner min-h-[140px]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--slate-900)] text-[var(--slate-400)]">
          <tr>
            <th className="p-2 font-normal border-b border-[var(--slate-800)]">Feature</th>
            <th className="p-2 font-normal border-b border-[var(--slate-800)]">Detected</th>
            <th className="p-2 font-normal border-b border-[var(--slate-800)] text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-[var(--slate-300)]">
          <tr className="bg-[var(--slate-900)]/20">
            <td className="p-2 border-b border-[var(--slate-800)]/50">user_age</td>
            <td className="p-2 border-b border-[var(--slate-800)]/50 text-indigo-400">int64</td>
            <td className="p-2 border-b border-[var(--slate-800)]/50 text-right text-[var(--success)]">OK</td>
          </tr>
          <tr>
            <td className="p-2 border-b border-[var(--slate-800)]/50">zip_code</td>
            <td className="p-2 border-b border-[var(--slate-800)]/50 text-[var(--warning)]">int64</td>
            <td className="p-2 border-b border-[var(--slate-800)]/50 text-right text-[var(--warning)]">FLAG</td>
          </tr>
          <tr className="bg-[var(--slate-900)]/20">
            <td className="p-2 border-b border-[var(--slate-800)]/50">user_id</td>
            <td className="p-2 border-b border-[var(--slate-800)]/50 text-[var(--warning)]">int64</td>
            <td className="p-2 border-b border-[var(--slate-800)]/50 text-right text-[var(--warning)]">FLAG</td>
          </tr>
          <tr>
            <td className="p-2">tx_amount</td>
            <td className="p-2 text-indigo-400">float64</td>
            <td className="p-2 text-right text-[var(--success)]">OK</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ConfidenceView() {
  const columns = [
    { name: 'zip_code', type: 'Category', confidence: 94 },
    { name: 'user_id', type: 'ID (Drop)', confidence: 98 },
    { name: 'tx_date', type: 'Datetime', confidence: 87 },
    { name: 'is_fraud', type: 'Boolean', confidence: 99 },
  ];

  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-xs shadow-inner min-h-[140px] space-y-3">
      {columns.map((col) => (
        <div key={col.name} className="flex items-center gap-3">
          <span className="text-[var(--slate-400)] w-20 truncate">{col.name}</span>
          <span className="px-2 py-0.5 rounded bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold">
            {col.type}
          </span>
          <div className="flex-1 h-1.5 bg-[var(--slate-800)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary)] to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${col.confidence}%` }}
            />
          </div>
          <span className="text-[var(--success)] font-bold w-10 text-right">{col.confidence}%</span>
        </div>
      ))}
    </div>
  );
}

function TerminalView() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-[11px] shadow-inner flex flex-col gap-2 min-h-[140px]">
      <div className="text-[var(--slate-500)]"># Business Rule Injection</div>
      <div className="flex items-center gap-2 text-[var(--slate-400)]">
        <span className="text-[var(--success)]">+</span>
        <span className="text-white">WHERE year != 2020</span>
        <span className="text-[var(--slate-600)]">-- COVID outliers</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--slate-400)]">
        <span className="text-[var(--success)]">+</span>
        <span className="text-white">user_id IS NOT NULL</span>
        <span className="text-[var(--slate-600)]">-- integrity</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--slate-400)]">
        <span className="text-[var(--success)]">+</span>
        <span className="text-white">tx_amount BETWEEN 0 AND 10000</span>
      </div>
      <div className="text-[var(--primary)] mt-1 typing-cursor">3 laws injected</div>
    </div>
  );
}

function ChatView() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-xs shadow-inner min-h-[140px] space-y-3">
      <div className="flex gap-2">
        <div className="size-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3 h-3 text-[var(--primary)]" />
        </div>
        <div className="bg-[var(--slate-900)] p-2 rounded-lg rounded-tl-none text-[var(--slate-300)]">
          What's your primary business objective?
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <div className="bg-[var(--primary)]/20 p-2 rounded-lg rounded-tr-none text-white">
          Predict customer churn within 30 days
        </div>
      </div>
      <div className="flex gap-2">
        <div className="size-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3 h-3 text-[var(--primary)]" />
        </div>
        <div className="bg-[var(--slate-900)] p-2 rounded-lg rounded-tl-none text-[var(--slate-300)]">
          Any known data anomalies to exclude?
        </div>
      </div>
    </div>
  );
}

function PipelineView() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-[10px] shadow-inner min-h-[140px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="px-2 py-1 rounded bg-[var(--slate-800)] text-[var(--slate-300)] flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-[var(--success)]" />
          Data Input
        </div>
        <div className="w-6 h-px bg-[var(--slate-700)]" />
        <div className="px-2 py-1 rounded border border-dashed border-[var(--primary)] text-white bg-[var(--primary)]/10 flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          MinMaxScaler
        </div>
        <div className="w-6 h-px bg-[var(--slate-700)]" />
        <div className="px-2 py-1 rounded bg-[var(--slate-800)] text-[var(--slate-300)] flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-[var(--slate-500)]" />
          XGBoost
        </div>
      </div>
      <div className="text-[var(--slate-500)] mb-2">Swapping StandardScaler with MinMaxScaler...</div>
      <div className="flex items-center gap-2 text-[var(--primary)]">
        <GitBranch className="w-3 h-3" />
        <span>Only affected path recalculates</span>
      </div>
    </div>
  );
}

function ChecklistView() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-xs shadow-inner flex flex-col gap-3 min-h-[140px]">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--slate-800)]/50">
        <span className="text-white font-bold uppercase">Gateway Check</span>
        <span className="size-2 rounded-full bg-[var(--warning)] animate-pulse" />
      </div>
      <div className="flex items-center gap-2 text-[var(--slate-400)]">
        <CheckSquare className="w-4 h-4 text-[var(--success)]" />
        <span>Schema Validated</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--slate-400)]">
        <CheckSquare className="w-4 h-4 text-[var(--success)]" />
        <span>Laws Injected (3)</span>
      </div>
      <div className="flex items-center gap-2 text-[var(--slate-400)]">
        <CheckSquare className="w-4 h-4 text-[var(--success)]" />
        <span>Context Gathered</span>
      </div>
      <div className="flex items-center gap-2 text-white">
        <Square className="w-4 h-4 text-[var(--slate-600)]" />
        <span>Metric Goal Locked</span>
      </div>
    </div>
  );
}

function MetricsView() {
  return (
    <div className="bg-[var(--obsidian)] border border-[var(--slate-800)] rounded-lg p-4 font-mono text-xs shadow-inner min-h-[140px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-bold uppercase">Training Metrics</span>
        <span className="text-[var(--success)] text-[10px]">Epoch 47/50</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--slate-900)] p-3 rounded">
          <div className="text-[var(--slate-500)] text-[10px] mb-1">F1-Score</div>
          <div className="text-white text-lg font-bold">0.87</div>
          <div className="text-[var(--success)] text-[10px]">+2.4%</div>
        </div>
        <div className="bg-[var(--slate-900)] p-3 rounded">
          <div className="text-[var(--slate-500)] text-[10px] mb-1">RMSE</div>
          <div className="text-white text-lg font-bold">0.12</div>
          <div className="text-[var(--success)] text-[10px]">-0.03</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-[var(--slate-800)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--success)] rounded-full w-[94%]" />
        </div>
        <span className="text-[var(--success)]">94%</span>
      </div>
    </div>
  );
}

export function MethodologyStepper() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const scroller = scrollerRef.current;
    if (!section || !scroller) return;

    const scrollWidth = scroller.scrollWidth - section.clientWidth;
    const totalSteps = methodologySteps.length;

    const tween = gsap.to(scroller, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollWidth * 3}`,
        scrub: 2,
        pin: true,
        anticipatePin: 1,
        snap: {
          snapTo: 1 / (totalSteps - 1),
          duration: { min: 0.2, max: 0.5 },
          ease: 'power2.inOut',
        },
        onUpdate: (self) => {
          const progress = self.progress;
          const newStep = Math.min(
            Math.floor(progress * totalSteps),
            totalSteps - 1
          );
          setActiveStep(newStep);
        },
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [prefersReducedMotion]);

  const renderContent = (type: string) => {
    switch (type) {
      case 'upload':
        return <UploadView />;
      case 'table':
        return <DataTable />;
      case 'confidence':
        return <ConfidenceView />;
      case 'terminal':
        return <TerminalView />;
      case 'chat':
        return <ChatView />;
      case 'pipeline':
        return <PipelineView />;
      case 'checklist':
        return <ChecklistView />;
      case 'metrics':
        return <MetricsView />;
      default:
        return null;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen overflow-hidden bg-[var(--obsidian)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              The 10-Minute Automation Methodology
            </h2>
            <p className="text-[var(--slate-400)]">
              Standardized intake for high-reliability AI systems.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="text-sm font-mono text-[var(--primary)] hover:text-white underline underline-offset-4 decoration-[var(--slate-700)] hover:decoration-white transition-all">
              View Full Protocol Docs
            </button>
          </div>
        </div>

        {/* Progress Indicator with Dots */}
        <div className="flex items-center gap-2 mb-8">
          {methodologySteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <motion.button
                onClick={() => {
                  if (prefersReducedMotion) setActiveStep(index);
                }}
                className={`relative size-3 rounded-full transition-all duration-300 ${
                  index === activeStep
                    ? 'bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]'
                    : index < activeStep
                    ? 'bg-[var(--primary)]/60'
                    : 'bg-[var(--slate-700)]'
                }`}
                whileHover={prefersReducedMotion ? {} : { scale: 1.3 }}
                aria-label={`Step ${index + 1}: ${step.title}`}
              >
                {index === activeStep && !prefersReducedMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[var(--primary)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
              {index < methodologySteps.length - 1 && (
                <motion.div
                  className="h-0.5 w-6 md:w-10 rounded-full"
                  animate={{
                    backgroundColor:
                      index < activeStep
                        ? 'var(--primary)'
                        : 'var(--slate-800)',
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Label */}
        <motion.div
          className="mb-6 flex items-center gap-3"
          key={activeStep}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-mono text-sm font-bold px-3 py-1 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
            {methodologySteps[activeStep]?.time}
          </span>
          <span className="text-white font-bold text-lg">
            {methodologySteps[activeStep]?.title}
          </span>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollerRef}
          className="flex gap-0"
          style={{ width: prefersReducedMotion ? '100%' : 'max-content' }}
        >
          {methodologySteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.title}
                className={`relative flex-shrink-0 border border-[var(--slate-800)] p-6 lg:p-8 transition-colors ${
                  prefersReducedMotion ? 'w-full' : 'w-[380px] lg:w-[420px]'
                } ${index === 0 ? 'rounded-l-xl' : ''} ${
                  index === methodologySteps.length - 1
                    ? 'rounded-r-xl'
                    : 'border-r-0'
                } ${
                  index === activeStep
                    ? 'bg-[var(--slate-900)]/50'
                    : 'bg-transparent hover:bg-[var(--slate-900)]/30'
                }`}
                initial={prefersReducedMotion ? {} : { opacity: 0.4 }}
                animate={{
                  opacity: index === activeStep || prefersReducedMotion ? 1 : 0.4,
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Active Indicator Bar */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: index <= activeStep || prefersReducedMotion ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                />

                {/* Step Header */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
                      index === activeStep
                        ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/30'
                        : 'bg-[var(--slate-800)]'
                    }`}
                    animate={{
                      boxShadow:
                        index === activeStep
                          ? '0 0 15px rgba(90, 92, 242, 0.3)'
                          : 'none',
                    }}
                  >
                    <StepIcon
                      className={`w-5 h-5 ${
                        index === activeStep
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--slate-500)]'
                      }`}
                    />
                  </motion.div>
                  <div>
                    <motion.span
                      className="font-mono text-[10px] font-bold block"
                      animate={{
                        color:
                          index <= activeStep
                            ? 'var(--primary)'
                            : 'var(--slate-500)',
                      }}
                    >
                      {step.time}
                    </motion.span>
                    <h3 className="font-bold text-white">{step.title}</h3>
                  </div>
                </div>

                {/* Visual Content */}
                <div className="mb-4">{renderContent(step.content)}</div>

                {/* Description */}
                <p className="text-sm text-[var(--slate-400)] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll Hint */}
        {!prefersReducedMotion && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-2 text-[var(--slate-600)] text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: activeStep === 0 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span>Scroll to explore</span>
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="font-mono">--&gt;</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
