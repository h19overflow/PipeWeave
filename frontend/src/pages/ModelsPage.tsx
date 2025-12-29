/**
 * ModelsPage - Main page for viewing and managing trained models
 * Displays model cards with filtering, sorting, and search capabilities
 */

import { useState, useMemo } from 'react';
import { ModelsList, ModelFilters } from '@/components/models';
import type { MLModel, MLModelFilters } from '@/types/models';

// Mock data for demonstration
const MOCK_MODELS: MLModel[] = [
  {
    id: '1',
    name: 'Churn Predictor v2',
    type: 'classification',
    algorithm: 'Random Forest',
    metrics: { accuracy: 0.94, precision: 0.92, recall: 0.89, f1: 0.905 },
    trainedAt: new Date('2024-12-28'),
    datasetName: 'customers.csv',
    status: 'ready',
  },
  {
    id: '2',
    name: 'Sales Forecast Q1',
    type: 'regression',
    algorithm: 'XGBoost',
    metrics: { rmse: 1245.67, mae: 892.34, r2: 0.87 },
    trainedAt: new Date('2024-12-27'),
    datasetName: 'sales_2024.csv',
    status: 'ready',
  },
  {
    id: '3',
    name: 'Fraud Detector',
    type: 'classification',
    algorithm: 'Neural Network',
    metrics: {},
    trainedAt: new Date(),
    datasetName: 'transactions.csv',
    status: 'training',
  },
  {
    id: '4',
    name: 'Customer Segmentation',
    type: 'classification',
    algorithm: 'K-Means + LogReg',
    metrics: { accuracy: 0.88, precision: 0.85, recall: 0.91, f1: 0.88 },
    trainedAt: new Date('2024-12-26'),
    datasetName: 'customer_data.csv',
    status: 'ready',
  },
  {
    id: '5',
    name: 'Price Optimizer',
    type: 'regression',
    algorithm: 'Gradient Boosting',
    metrics: { rmse: 45.23, mae: 32.11, r2: 0.92 },
    trainedAt: new Date('2024-12-25'),
    datasetName: 'pricing_history.csv',
    status: 'ready',
  },
];

export function ModelsPage() {
  const [isLoading] = useState(false);
  const [filters, setFilters] = useState<MLModelFilters>({
    type: 'all',
    status: 'all',
    sortBy: 'newest',
    searchQuery: '',
  });

  // Apply filters and sorting
  const filteredModels = useMemo(() => {
    let result = [...MOCK_MODELS];

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter((model) => model.type === filters.type);
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((model) => model.status === filters.status);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.algorithm.toLowerCase().includes(query) ||
          model.datasetName.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return b.trainedAt.getTime() - a.trainedAt.getTime();
      }
      if (filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (filters.sortBy === 'best-performance') {
        const getScore = (model: MLModel) => {
          if (model.type === 'classification') {
            return (model.metrics as any).accuracy || 0;
          }
          return (model.metrics as any).r2 || 0;
        };
        return getScore(b) - getScore(a);
      }
      return 0;
    });

    return result;
  }, [filters]);

  const handleDownload = (id: string) => {
    console.log('Download model:', id);
    // TODO: Implement model download
  };

  const handleView = (id: string) => {
    console.log('View model:', id);
    // TODO: Navigate to model details page
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Models</h1>
        <p className="text-[#9b92c9]">
          View and manage your trained machine learning models
        </p>
      </div>

      {/* Filters */}
      <ModelFilters filters={filters} onFiltersChange={setFilters} />

      {/* Models Grid */}
      <ModelsList
        models={filteredModels}
        isLoading={isLoading}
        onDownload={handleDownload}
        onView={handleView}
      />
    </div>
  );
}
