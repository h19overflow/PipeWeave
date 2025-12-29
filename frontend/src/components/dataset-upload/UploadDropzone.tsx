import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';

interface UploadDropzoneProps {
  onDrop: (files: File[]) => void;
  status: UploadStatus;
  disabled?: boolean;
  error?: string | null;
}

const statusConfig = {
  idle: {
    icon: Upload,
    text: 'Drop your dataset here',
    subtext: 'or click to browse',
    borderClass: 'border-dashed border-[#1e1a36]',
    iconColor: 'text-[#9b92c9]',
  },
  parsing: {
    icon: Loader2,
    text: 'Analyzing structure...',
    subtext: 'Reading CSV headers and sample rows',
    borderClass: 'border-solid border-[#3713ec]/50',
    iconColor: 'text-[#3713ec]',
  },
  uploading: {
    icon: Loader2,
    text: 'Uploading dataset...',
    subtext: 'Transferring to PipeWeave storage',
    borderClass: 'border-solid border-[#3713ec]',
    iconColor: 'text-[#3713ec]',
  },
  complete: {
    icon: CheckCircle2,
    text: 'Dataset ready',
    subtext: 'Upload complete, proceed to schema deduction',
    borderClass: 'border-solid border-[#22c55e]',
    iconColor: 'text-[#22c55e]',
  },
  error: {
    icon: AlertCircle,
    text: 'Upload failed',
    subtext: 'Check file format and size requirements',
    borderClass: 'border-solid border-[#ef4444]',
    iconColor: 'text-[#ef4444]',
  },
};

export function UploadDropzone({ onDrop, status, disabled = false, error }: UploadDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/tab-separated-values': ['.tsv'] },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    disabled: disabled || status === 'uploading' || status === 'parsing',
  });

  const config = statusConfig[status];
  const Icon = config.icon;
  const isProcessing = status === 'uploading' || status === 'parsing';

  return (
    <div className="relative w-full">
      {/* Scan-line effect background */}
      <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #3713ec 2px, #3713ec 3px)',
          }}
          animate={{ y: isDragActive ? [0, 3] : 0 }}
          transition={{ duration: 0.05, repeat: isDragActive ? Infinity : 0, ease: 'linear' }}
        />
      </div>

      {/* Dropzone container - using regular div to avoid framer-motion conflicts */}
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 bg-[#131022] transition-all duration-300',
          'flex flex-col items-center justify-center px-8 py-16',
          'hover:bg-[#1a1430] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3713ec]',
          config.borderClass,
          disabled && 'cursor-not-allowed opacity-50',
          isDragActive && 'border-solid border-[#3713ec] bg-[#1a1430] shadow-[0_0_30px_rgba(55,19,236,0.3)] scale-[1.01]'
        )}
      >
        <input {...getInputProps()} />

        {/* Icon with state animation */}
        <motion.div
          className="relative mb-6"
          animate={{ rotate: isProcessing ? 360 : 0 }}
          transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' }}
        >
          <Icon className={cn('h-16 w-16', config.iconColor)} strokeWidth={1.5} />
          <AnimatePresence>
            {(isDragActive || isProcessing) && (
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl bg-[#3713ec]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1.2 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Text content */}
        <div className="text-center space-y-2">
          <motion.p
            className="text-lg font-medium text-white tracking-tight font-mono"
            key={config.text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {config.text}
          </motion.p>
          <motion.p
            className="text-sm text-[#9b92c9] font-mono"
            key={config.subtext}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {error || config.subtext}
          </motion.p>
        </div>

        {/* File format badge */}
        <motion.div
          className="mt-8 flex items-center gap-2 rounded-full border border-[#1e1a36] bg-[#0a0a0f]/50 px-4 py-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-[#3713ec]" />
          <span className="text-xs text-[#9b92c9] tracking-wide font-mono">CSV, TSV • MAX 100MB</span>
        </motion.div>
      </div>
    </div>
  );
}
