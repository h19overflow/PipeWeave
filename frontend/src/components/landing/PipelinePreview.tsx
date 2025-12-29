import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Database,
  GitBranch,
  Ruler,
  Layers,
  Brain,
  Info,
  ArrowRightLeft,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const sidebarNodes = [
  { icon: ArrowRightLeft, label: 'StandardScaler', active: false },
  { icon: Ruler, label: 'MinMaxScaler', active: true },
  { icon: Layers, label: 'OneHotEncoder', active: false },
];

interface PipelineNodeProps {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  className?: string;
  isSwapping?: boolean;
  isGhost?: boolean;
  delay?: number;
}

function PipelineNode({
  icon: Icon,
  label,
  sublabel,
  className = '',
  isSwapping = false,
  isGhost = false,
  delay = 0,
}: PipelineNodeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isGhost) {
    return (
      <div className="w-[160px] h-[60px] bg-[var(--slate-800)]/40 rounded-lg border border-[var(--slate-700)] flex flex-col items-center justify-center text-[var(--slate-500)] text-xs grayscale blur-[1px]">
        <div className="flex items-center gap-2 font-bold mb-1">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-white text-xs shadow-lg z-10 ${className}`}
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: prefersReducedMotion ? 0 : delay,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
    >
      <div className="flex items-center gap-2 font-bold mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      {sublabel && (
        <div
          className={`text-[10px] font-mono ${
            isSwapping
              ? 'text-[var(--slate-400)]'
              : sublabel === 'Ready to Train'
              ? 'text-[var(--success)]'
              : 'text-[var(--slate-400)]'
          }`}
        >
          {sublabel}
        </div>
      )}
    </motion.div>
  );
}

export function PipelinePreview() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimationTriggered(true);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      onEnter: () => setAnimationTriggered(true),
    });

    return () => {
      trigger.kill();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!animationTriggered || prefersReducedMotion) return;

    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll('path');
    paths.forEach((path, index) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1,
        delay: 0.3 + index * 0.15,
        ease: 'power2.inOut',
      });
    });
  }, [animationTriggered, prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="w-full max-w-[1280px] px-6 py-12 mb-24">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <GitBranch className="w-5 h-5 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold text-white">
          Stage 2 Preview: Surgical Swapping
        </h2>
      </div>

      {/* Pipeline Editor Container */}
      <div className="relative w-full h-[500px] bg-[var(--slate-900)] rounded-xl border border-[var(--slate-800)] overflow-hidden shadow-2xl flex">
        {/* Sidebar */}
        <motion.div
          className="w-64 border-r border-[var(--slate-800)] bg-[var(--obsidian)] hidden md:flex flex-col p-4 gap-4"
          initial={prefersReducedMotion ? {} : { x: -50, opacity: 0 }}
          animate={animationTriggered ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-xs font-mono text-[var(--slate-500)] uppercase font-bold tracking-wider mb-2">
            Node Library
          </div>

          {sidebarNodes.map((node, index) => (
            <motion.div
              key={node.label}
              className={`p-3 rounded border text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                node.active
                  ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-white shadow-[0_0_10px_rgba(90,92,242,0.2)] cursor-move'
                  : 'bg-[var(--slate-800)]/50 border-[var(--slate-700)]/50 text-[var(--slate-300)] hover:border-[var(--primary)] hover:text-white'
              }`}
              initial={prefersReducedMotion ? {} : { x: -20, opacity: 0 }}
              animate={animationTriggered ? { x: 0, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <node.icon className="w-4 h-4" />
              {node.label}
            </motion.div>
          ))}

          <motion.div
            className="mt-auto p-4 rounded bg-[var(--slate-800)]/30 border border-[var(--slate-800)] text-xs text-[var(--slate-400)] font-mono"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={animationTriggered ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div>&gt; Drag to swap</div>
            <div>&gt; Auto-recompute</div>
          </motion.div>
        </motion.div>

        {/* Canvas */}
        <div className="flex-1 relative bg-grid bg-[length:20px_20px] bg-[var(--obsidian)]/50 p-8 overflow-hidden">
          {/* SVG Connectors */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <AnimatePresence>
              {animationTriggered && (
                <>
                  {/* Source -> Split */}
                  <path
                    d="M 140 100 C 200 100, 200 240, 280 240"
                    fill="none"
                    stroke="var(--slate-700)"
                    strokeWidth="2"
                  />
                  {/* Split -> Scaler (Active) */}
                  <path
                    d="M 440 240 C 480 240, 480 150, 540 150"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  {/* Split -> Encoder */}
                  <path
                    d="M 440 240 C 480 240, 480 330, 540 330"
                    fill="none"
                    stroke="var(--slate-700)"
                    strokeWidth="2"
                  />
                  {/* Scaler -> Model (Active) */}
                  <path
                    d="M 700 150 C 760 150, 760 240, 820 240"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  {/* Encoder -> Model */}
                  <path
                    d="M 700 330 C 760 330, 760 240, 820 240"
                    fill="none"
                    stroke="var(--slate-700)"
                    strokeWidth="2"
                  />
                </>
              )}
            </AnimatePresence>
          </svg>

          {/* Pipeline Nodes */}
          <AnimatePresence>
            {animationTriggered && (
              <>
                {/* Source Node */}
                <div className="absolute top-[80px] left-[40px]">
                  <PipelineNode
                    icon={Database}
                    label="Source"
                    className="w-[100px] h-[40px] bg-[var(--slate-800)] rounded border border-[var(--slate-600)]"
                    delay={0.1}
                  />
                </div>

                {/* Split Node */}
                <div className="absolute top-[210px] left-[280px]">
                  <PipelineNode
                    icon={GitBranch}
                    label="Train/Test Split"
                    sublabel="Ratio: 0.8"
                    className="w-[160px] h-[60px] bg-[var(--slate-800)] rounded-lg border border-[var(--slate-600)]"
                    delay={0.3}
                  />
                </div>

                {/* Ghost Node (Being Replaced) */}
                <div className="absolute top-[80px] left-[520px] z-0">
                  <PipelineNode
                    icon={ArrowRightLeft}
                    label="StandardScaler"
                    isGhost
                  />
                </div>

                {/* Swapping Node (MinMaxScaler) */}
                <motion.div
                  className="absolute top-[120px] left-[540px] z-10"
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          boxShadow: [
                            '0 0 15px rgba(90, 92, 242, 0.4)',
                            '0 0 25px rgba(90, 92, 242, 0.6)',
                            '0 0 15px rgba(90, 92, 242, 0.4)',
                          ],
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <PipelineNode
                    icon={Ruler}
                    label="MinMaxScaler"
                    sublabel="Swapping..."
                    className="w-[160px] h-[60px] bg-[var(--slate-900)] rounded-lg border-2 border-[var(--primary)] border-dashed"
                    isSwapping
                    delay={0.5}
                  />
                </motion.div>

                {/* Encoder Node */}
                <div className="absolute top-[300px] left-[540px]">
                  <PipelineNode
                    icon={Layers}
                    label="OneHotEncoder"
                    sublabel="Cols: [zip, type]"
                    className="w-[160px] h-[60px] bg-[var(--slate-800)] rounded-lg border border-[var(--slate-600)]"
                    delay={0.4}
                  />
                </div>

                {/* Model Node */}
                <div className="absolute top-[210px] left-[820px]">
                  <PipelineNode
                    icon={Brain}
                    label="XGBoost Class."
                    sublabel="Ready to Train"
                    className="w-[160px] h-[60px] bg-[var(--slate-800)] rounded-lg border border-[var(--slate-600)]"
                    delay={0.6}
                  />
                </div>

                {/* Info Tooltip */}
                <motion.div
                  className="absolute top-[60px] left-[660px] bg-[var(--slate-900)] border border-[var(--slate-700)] p-3 rounded shadow-xl max-w-[200px] z-20"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white text-xs font-bold mb-1">
                        Surgical Swap
                      </h4>
                      <p className="text-[10px] text-[var(--slate-400)] leading-tight">
                        Changing scaler triggers re-run ONLY on the highlighted
                        Indigo path. Encoder path remains cached.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
