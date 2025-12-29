/**
 * DatasetUploadPage - Main page for uploading CSV/TSV datasets
 * Provides drag & drop upload, CSV preview, and metadata form
 */
import { motion } from 'framer-motion';
import { ArrowRight, FileSpreadsheet, RotateCcw, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadDropzone } from '@/components/dataset-upload/UploadDropzone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

export function DatasetUploadPage() {
  const navigate = useNavigate();
  const { markStepComplete } = useWorkflowProgress();
  const { file, preview, progress, status, error, handleDrop, handleUpload, reset } = useFileUpload();

  const handleProceed = () => {
    markStepComplete('dataset');
    navigate('/schema');
  };

  return (
    <div className="h-full bg-[#0a0a0f] p-6 md:p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight">Upload Dataset</h1>
          <p className="text-[#9b92c9] text-sm">
            Upload a CSV or TSV file to begin your ML pipeline journey
          </p>
        </motion.div>

        {/* Upload Dropzone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <UploadDropzone onDrop={handleDrop} status={status} error={error} />
        </motion.div>

        {/* File Info & Preview */}
        {file && preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* File Metadata Card */}
            <div className="rounded-lg border border-[#1e1a36] bg-[#131022] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3713ec]/10">
                    <FileSpreadsheet className="h-5 w-5 text-[#3713ec]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-[#9b92c9]">
                      {(file.size / 1024).toFixed(1)} KB • {preview.headers.length} columns • {preview.totalRows.toLocaleString()} rows
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-[#9b92c9] hover:bg-[#1e1a36] hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Replace
                </button>
              </div>

              {/* Upload Progress */}
              {status === 'uploading' && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9b92c9]">Uploading...</span>
                    <span className="text-white font-mono">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-[#1e1a36]" indicatorClassName="bg-[#3713ec]" />
                </div>
              )}
            </div>

            {/* CSV Preview Table */}
            <div className="rounded-lg border border-[#1e1a36] bg-[#131022] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1a36]">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#9b92c9]" />
                  <span className="text-sm font-medium text-white">Data Preview</span>
                </div>
                <span className="text-xs text-[#9b92c9]">Showing first {preview.rows.length} of {preview.totalRows.toLocaleString()} rows</span>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-[#1e1a36] hover:bg-transparent">
                      {preview.headers.map((header) => (
                        <TableHead key={header} className="text-[#9b92c9] font-mono text-xs whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx} className="border-[#1e1a36] hover:bg-[#1a1430]">
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className="text-white text-xs font-mono whitespace-nowrap py-2">
                            {cell || <span className="text-[#9b92c9] italic">null</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              {status !== 'complete' ? (
                <motion.button
                  onClick={handleUpload}
                  disabled={status === 'uploading' || status === 'parsing'}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium',
                    'bg-[#3713ec] text-white shadow-lg shadow-[#3713ec]/25',
                    'hover:bg-[#4a2aff] transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Upload Dataset
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleProceed}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium',
                    'bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25',
                    'hover:bg-[#16a34a] transition-colors'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  Proceed to Schema
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
