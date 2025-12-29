/**
 * SchemaDeductionPage - Main orchestration component for schema deduction UI
 * Coordinates all animated components with proper motion choreography
 */
import { useState, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ContextPanel,
  SchemaTable,
  AgentReasoningDrawer,
} from '@/components/schema-deduction';
import type {
  ColumnDeduction,
  DataType,
  ProjectInfo,
  DatasetMetadata,
  PipelineStage,
  AgentLogEntry,
} from '@/types/schema-deduction';

const INITIAL_COLUMNS: ColumnDeduction[] = [
  {
    id: '1', name: 'user_id', icon: 'tag', aiType: 'Integer',
    confidence: 98, confidenceLevel: 'High', manualOverride: null, isLocked: true, needsReview: false,
  },
  {
    id: '2', name: 'churn_risk', icon: 'help_center', aiType: 'Boolean',
    confidence: 60, confidenceLevel: 'Review', manualOverride: 'Float', isLocked: false, needsReview: true,
  },
  {
    id: '3', name: 'created_at', icon: 'calendar_today', aiType: 'Datetime',
    confidence: 99, confidenceLevel: 'High', manualOverride: null, isLocked: true, needsReview: false,
  },
  {
    id: '4', name: 'customer_segment', icon: 'category', aiType: 'Category',
    confidence: 92, confidenceLevel: 'Medium', manualOverride: null, isLocked: true, needsReview: false,
  },
  {
    id: '5', name: 'lead_score', icon: 'show_chart', aiType: 'Float',
    confidence: 85, confidenceLevel: 'High', manualOverride: null, isLocked: true, needsReview: false,
  },
];

const PROJECT: ProjectInfo = { name: 'Project Alpha', environment: 'Prod', isOnline: true };

const METADATA: DatasetMetadata = {
  sourceFile: 'raw_customer_leads.csv', rowCount: 45201, sizeInMb: 12.4, lastUpdated: '2 mins ago',
};

const STAGES: PipelineStage[] = [
  { id: '1', name: 'Ingestion', icon: 'download', status: 'completed', statusText: 'Completed' },
  { id: '2', name: 'Schema Deduction', icon: 'sync', status: 'active', statusText: 'In Progress' },
  { id: '3', name: 'Cleaning', icon: 'cleaning_services', status: 'pending', statusText: 'Pending' },
  { id: '4', name: 'Vectorization', icon: 'polyline', status: 'pending', statusText: 'Pending' },
];

const INITIAL_LOGS: AgentLogEntry[] = [
  {
    id: '1', type: 'active', title: "Analysing 'churn_risk'", timestamp: '10:42:05',
    message: `Column contains values <code class="bg-black px-1 py-0.5 rounded text-yellow-300 font-mono">0</code> and <code class="bg-black px-1 py-0.5 rounded text-yellow-300 font-mono">1</code>. While numerically integers, pattern recognition suggests <code class="font-mono text-purple-300">Boolean</code> logic.`,
    sampleData: ['0', '1', '1', '0', '1', '0'],
  },
  {
    id: '2', type: 'completed', title: 'Deduction Complete: user_id', timestamp: '10:41:58',
    message: 'Identified 45,201 unique values. No duplicates. Classified as <code class="font-mono text-blue-300">Integer</code> (Unique Identifier).',
  },
  {
    id: '3', type: 'completed', title: 'Deduction Complete: created_at', timestamp: '10:41:55',
    message: 'Parsed ISO 8601 format successfully. Confidence 99%.',
  },
  {
    id: '4', type: 'system', title: 'Started deduction job #8821', timestamp: '10:41:50',
    message: 'Scanning first 1000 rows for type inference...',
  },
];

export function SchemaDeductionPage() {
  const prefersReducedMotion = useReducedMotion();
  const [columns, setColumns] = useState<ColumnDeduction[]>(INITIAL_COLUMNS);
  const [logs, setLogs] = useState<AgentLogEntry[]>(INITIAL_LOGS);
  const [isRerunning, setIsRerunning] = useState(false);

  const overallConfidence = useMemo(() => {
    const total = columns.reduce((sum, col) => sum + col.confidence, 0);
    return Math.round(total / columns.length);
  }, [columns]);

  const stats = useMemo(() => ({
    confirmed: columns.filter((c) => c.isLocked).length,
    needsReview: columns.filter((c) => c.needsReview).length,
    total: 42,
  }), [columns]);

  const handleLockToggle = useCallback((id: string) => {
    setColumns((prev) => prev.map((col) =>
      col.id === id ? { ...col, isLocked: !col.isLocked } : col
    ));
  }, []);

  const handleOverrideChange = useCallback((id: string, type: DataType) => {
    setColumns((prev) => prev.map((col) =>
      col.id === id ? { ...col, manualOverride: type } : col
    ));
  }, []);

  const handleRerun = useCallback(() => {
    setIsRerunning(true);
    setTimeout(() => setIsRerunning(false), 2000);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const newLog: AgentLogEntry = {
      id: Date.now().toString(),
      type: 'system',
      title: `User query: "${message}"`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 8),
      message: 'Processing your question...',
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  return (
    <div className="bg-[#0a0a0f] text-white font-display h-full flex overflow-hidden antialiased selection:bg-[#3713ec] selection:text-white">
      <ContextPanel project={PROJECT} metadata={METADATA} stages={STAGES} />

      <main className="flex-1 flex flex-col bg-[#0f0c1d] relative min-w-0">
        <motion.header
          className="h-20 border-b border-[#3b3267] flex items-center justify-between px-6 bg-[#141122]/50 backdrop-blur-sm sticky top-0 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">Schema Deduction</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#3713ec]/20 border border-[#3713ec]/30 text-[#3713ec] text-xs font-mono font-medium">v1.2-beta</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9b92c9]">Overall Confidence:</span>
              <span className="text-green-400 font-mono font-bold">{overallConfidence}%</span>
              <span className="text-[#9b92c9] text-xs ml-1">(High)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3b3267] bg-[#1e1933] text-white hover:bg-[#252040] transition text-sm font-medium"
              onClick={handleRerun}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              <motion.span
                className="material-symbols-outlined text-[18px]"
                animate={isRerunning && !prefersReducedMotion ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRerunning ? Infinity : 0, ease: 'linear' }}
              >
                refresh
              </motion.span>
              Re-run Deduction
            </motion.button>

            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3713ec] hover:bg-[#3713ec]/90 text-white shadow-lg shadow-[#3713ec]/25 transition text-sm font-medium"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Apply Schema
            </motion.button>
          </div>
        </motion.header>

        <div className="flex-1 overflow-auto p-6">
          <SchemaTable
            columns={columns}
            onLockToggle={handleLockToggle}
            onOverrideChange={handleOverrideChange}
            isLoading={isRerunning}
          />

          <motion.div
            className="flex items-center justify-between mt-4 px-2 text-xs text-[#9b92c9]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>Showing {columns.length} of {stats.total} columns</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {stats.confirmed} Confirmed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {stats.needsReview} Needs Review
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      <AgentReasoningDrawer logs={logs} isAnalyzing={isRerunning} onSendMessage={handleSendMessage} />
    </div>
  );
}
