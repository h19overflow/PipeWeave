/**
 * EDAPage - Exploratory Data Analysis orchestrator page
 * Displays dataset profiling, column analysis, correlations, and missing value patterns
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricsRibbon, QualityScoreBadge, UpstreamChangeBanner, ColumnExplorer, ColumnDetailPanel, CorrelationHeatmap, MissingValuesMatrix } from '@/components/eda';
import type { EDAReport } from '@/types/eda';
import { MOCK_EDA_REPORT } from '@/data/mockEDAData';

export function EDAPage() {
  const [report] = useState<EDAReport>(MOCK_EDA_REPORT);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedColumnData = report.columns.find((c) => c.name === selectedColumn) ?? null;
  const numericColumns = report.columns.filter((c) => c.dtype === 'numeric').map((c) => c.name);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="min-h-full bg-[#0a0a0f] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stale data banner */}
        {report.isStale && (
          <UpstreamChangeBanner
            message="Dataset was updated after this analysis. Results may be outdated."
            onRefresh={handleRefresh}
            onDismiss={() => {}}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#3713ec]/10 rounded-xl border border-[#3713ec]/30">
              <FileText size={24} className="text-[#3713ec]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{report.datasetName}</h1>
              <p className="text-sm text-[#9b92c9]">
                Generated {report.generatedAt.toLocaleDateString()} at {report.generatedAt.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <QualityScoreBadge score={report.summary.qualityScore} size="md" />
            <Link
              to="/schema"
              className="px-4 py-2 bg-[#3713ec] hover:bg-[#4a2bef] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              Continue to Schema <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Metrics Ribbon */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <MetricsRibbon summary={report.summary} />
        </motion.div>

        {/* Column Explorer + Detail Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          style={{ minHeight: 420 }}
        >
          <div className="lg:col-span-1 h-[420px]">
            <ColumnExplorer columns={report.columns} selectedColumn={selectedColumn} onSelectColumn={setSelectedColumn} />
          </div>
          <div className="lg:col-span-2 h-[420px]">
            <ColumnDetailPanel column={selectedColumnData} />
          </div>
        </motion.div>

        {/* Expandable Sections */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="space-y-4">
          <CorrelationHeatmap correlations={report.correlations} columns={numericColumns} />
          <MissingValuesMatrix missingMatrix={report.missingMatrix} totalRows={report.summary.rowCount} />
        </motion.div>
      </div>
    </div>
  );
}
