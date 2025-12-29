/**
 * ModelFilters - Filter and search controls for models list
 * Provides type, status, sort, and search filtering
 */

import { Search } from 'lucide-react';
import type { MLModelFilters, MLModelType, MLModelStatus, MLModelSortBy } from '@/types/models';

interface ModelFiltersProps {
  filters: MLModelFilters;
  onFiltersChange: (filters: MLModelFilters) => void;
}

const TYPE_OPTIONS: Array<{ value: MLModelType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'classification', label: 'Classification' },
  { value: 'regression', label: 'Regression' },
];

const STATUS_OPTIONS: Array<{ value: MLModelStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'ready', label: 'Ready' },
  { value: 'training', label: 'Training' },
  { value: 'failed', label: 'Failed' },
];

const SORT_OPTIONS: Array<{ value: MLModelSortBy; label: string }> = [
  { value: 'newest', label: 'Newest First' },
  { value: 'best-performance', label: 'Best Performance' },
  { value: 'name', label: 'Name A-Z' },
];

export function ModelFilters({ filters, onFiltersChange }: ModelFiltersProps) {
  const handleTypeChange = (type: MLModelType | 'all') => {
    onFiltersChange({ ...filters, type });
  };

  const handleStatusChange = (status: MLModelStatus | 'all') => {
    onFiltersChange({ ...filters, status });
  };

  const handleSortChange = (sortBy: MLModelSortBy) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({ ...filters, searchQuery });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b92c9]" />
        <input
          type="text"
          placeholder="Search models..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#131022] border border-[#1e1a36] rounded-lg text-white placeholder:text-[#9b92c9] focus:outline-none focus:border-[#3713ec]/50 transition-colors"
        />
      </div>

      {/* Type Filter */}
      <select
        value={filters.type}
        onChange={(e) => handleTypeChange(e.target.value as MLModelType | 'all')}
        className="px-4 py-2 bg-[#131022] border border-[#1e1a36] rounded-lg text-white focus:outline-none focus:border-[#3713ec]/50 transition-colors cursor-pointer"
      >
        {TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => handleStatusChange(e.target.value as MLModelStatus | 'all')}
        className="px-4 py-2 bg-[#131022] border border-[#1e1a36] rounded-lg text-white focus:outline-none focus:border-[#3713ec]/50 transition-colors cursor-pointer"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => handleSortChange(e.target.value as MLModelSortBy)}
        className="px-4 py-2 bg-[#131022] border border-[#1e1a36] rounded-lg text-white focus:outline-none focus:border-[#3713ec]/50 transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
