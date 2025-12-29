/**
 * PreprocessingPage - Main orchestrator for preprocessing wizard
 * Manages step state, transform queue, and coordinates all subcomponents
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  StepWizardSidebar,
  ColumnSelectionStep,
  MissingValuesStep,
  EncodingStep,
  ScalingStep,
  ReviewStep,
  TransformQueuePanel,
  BeforeAfterPreview,
  UpstreamChangeBanner,
} from '@/components/preprocessing';
import type {
  WizardStep,
  PreprocessingConfig,
  MissingStrategy,
  EncodingStrategy,
  ScalingStrategy,
  Transform,
} from '@/types/preprocessing';
import { WIZARD_STEPS } from '@/types/preprocessing';
import { MOCK_COLUMNS, MOCK_PREVIEW, createInitialConfig } from './preprocessing.mock';

export function PreprocessingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState<WizardStep>('select');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  const [config, setConfig] = useState<PreprocessingConfig>(createInitialConfig);
  const [transforms, setTransforms] = useState<Transform[]>([]);
  const [history, setHistory] = useState<Transform[][]>([]);
  const [isStale, setIsStale] = useState(true);

  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const currentStepConfig = WIZARD_STEPS[currentIndex] ?? WIZARD_STEPS[0]!;
  const selectedColumnData = useMemo(() => MOCK_COLUMNS.filter(c => config.selectedColumns.includes(c.name)), [config.selectedColumns]);

  const handleStepClick = useCallback((step: WizardStep) => {
    if (completedSteps.includes(step) || step === currentStep) setCurrentStep(step);
  }, [completedSteps, currentStep]);

  const handleNext = useCallback(() => {
    const nextStep = WIZARD_STEPS[currentIndex + 1];
    if (nextStep) {
      setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
      setCurrentStep(nextStep.id);
    }
  }, [currentIndex, currentStep]);

  const handleBack = useCallback(() => {
    const prevStep = WIZARD_STEPS[currentIndex - 1];
    if (prevStep) setCurrentStep(prevStep.id);
  }, [currentIndex]);

  const updateConfig = useCallback(<K extends keyof PreprocessingConfig>(key: K, value: PreprocessingConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const addTransform = useCallback((column: string, operation: string, category: Transform['category']) => {
    setHistory(prev => [...prev, transforms]);
    setTransforms(prev => {
      const existing = prev.findIndex(t => t.column === column && t.category === category);
      const newTransform: Transform = { id: `${column}-${category}-${Date.now()}`, column, operation, category, params: {}, order: prev.length };
      return existing >= 0 ? [...prev.slice(0, existing), newTransform, ...prev.slice(existing + 1)] : [...prev, newTransform];
    });
  }, [transforms]);

  const handleMissingChange = useCallback((col: string, strategy: MissingStrategy) => {
    updateConfig('missingValueStrategies', { ...config.missingValueStrategies, [col]: strategy });
    addTransform(col, strategy.type, 'missing');
  }, [config.missingValueStrategies, updateConfig, addTransform]);

  const handleEncodingChange = useCallback((col: string, strategy: EncodingStrategy) => {
    updateConfig('encodingStrategies', { ...config.encodingStrategies, [col]: strategy });
    addTransform(col, strategy.type, 'encoding');
  }, [config.encodingStrategies, updateConfig, addTransform]);

  const handleScalingChange = useCallback((col: string, strategy: ScalingStrategy) => {
    updateConfig('scalingStrategies', { ...config.scalingStrategies, [col]: strategy });
    addTransform(col, strategy.type, 'scaling');
  }, [config.scalingStrategies, updateConfig, addTransform]);

  const handleUndo = useCallback(() => {
    const lastHistory = history[history.length - 1];
    if (lastHistory) {
      setTransforms(lastHistory);
      setHistory(prev => prev.slice(0, -1));
    }
  }, [history]);

  const handleApply = async () => { await new Promise(r => setTimeout(r, 2000)); };

  const slideDirection = prefersReducedMotion ? 0 : 1;

  return (
    <div className="bg-[#0a0a0f] text-white font-display h-full flex overflow-hidden antialiased selection:bg-[#3713ec] selection:text-white">
      <StepWizardSidebar currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />

      <main className="flex-1 flex flex-col bg-[#0f0c1d] min-w-0">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="h-16 border-b border-[#3b3267] flex items-center justify-between px-6 bg-[#141122]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">Data Preprocessing</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#3713ec]/20 border border-[#3713ec]/30 text-[#3713ec] text-xs font-medium">
              Step {currentIndex + 1}/{WIZARD_STEPS.length}
            </span>
          </div>
          <div className="flex gap-2">
            {currentIndex > 0 && <button onClick={handleBack} className="px-4 py-2 text-sm border border-[#3b3267] rounded-lg hover:bg-[#1e1933] transition">Back</button>}
            {currentIndex < WIZARD_STEPS.length - 1 && <button onClick={handleNext} className="px-4 py-2 text-sm bg-[#3713ec] rounded-lg hover:bg-[#3713ec]/90 transition shadow-lg shadow-[#3713ec]/25">Next Step</button>}
          </div>
        </motion.header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <UpstreamChangeBanner isVisible={isStale} onReconfigure={() => setCurrentStep('select')} onDismiss={() => setIsStale(false)} />

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">{currentStepConfig.label}</h2>
              <p className="text-sm text-[#9b92c9]">{currentStepConfig.description}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 * slideDirection }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 * slideDirection }} transition={{ duration: 0.3 }}>
                {currentStep === 'select' && <ColumnSelectionStep columns={MOCK_COLUMNS} selectedColumns={config.selectedColumns} onSelectionChange={cols => updateConfig('selectedColumns', cols)} />}
                {currentStep === 'missing' && <MissingValuesStep columns={selectedColumnData} strategies={config.missingValueStrategies} onStrategyChange={handleMissingChange} />}
                {currentStep === 'encode' && <EncodingStep columns={selectedColumnData} strategies={config.encodingStrategies} onStrategyChange={handleEncodingChange} />}
                {currentStep === 'scale' && <ScalingStep columns={selectedColumnData} strategies={config.scalingStrategies} onStrategyChange={handleScalingChange} />}
                {currentStep === 'review' && <ReviewStep config={config} preview={MOCK_PREVIEW} onApply={handleApply} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="w-80 border-l border-[#1e1a36] p-4 space-y-4 overflow-y-auto bg-[#0a0a0f]">
            <TransformQueuePanel transforms={transforms} onReorder={setTransforms} onRemove={id => setTransforms(prev => prev.filter(t => t.id !== id))} onUndo={handleUndo} canUndo={history.length > 0} />
            <BeforeAfterPreview preview={MOCK_PREVIEW} />
          </aside>
        </div>
      </main>
    </div>
  );
}
