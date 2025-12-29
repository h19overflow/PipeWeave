import { useState, useCallback } from 'react';

export interface PreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'complete' | 'error';

export interface UseFileUploadReturn {
  file: File | null;
  preview: PreviewData | null;
  progress: number;
  status: UploadStatus;
  error: string | null;
  handleDrop: (files: File[]) => void;
  handleUpload: () => Promise<void>;
  reset: () => void;
}

const parseCSV = (text: string): PreviewData => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) throw new Error('Empty file');

  const firstLine = lines[0];
  if (!firstLine) throw new Error('Empty file');

  const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1, 11).map(line =>
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );

  return { headers, rows, totalRows: lines.length - 1 };
};

export const useFileUpload = (): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const selectedFile = files[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();

    if (ext !== 'csv' && ext !== 'tsv') {
      setError('Only CSV and TSV files are supported');
      setStatus('error');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      setStatus('error');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setStatus('parsing');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);
        setPreview(parsedData);
        setStatus('idle');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
        setStatus('error');
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);

    // Simulate upload with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setStatus('complete');
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setStatus('idle');
    setError(null);
  }, []);

  return { file, preview, progress, status, error, handleDrop, handleUpload, reset };
};
