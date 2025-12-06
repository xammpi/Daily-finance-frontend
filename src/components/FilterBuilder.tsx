/**
 * FilterBuilder Component
 *
 * A dynamic, reusable component that renders filters based on configuration.
 * Supports multiple filter types: text, number, date, select, etc.
 */

import { Search, Filter, X, DollarSign } from 'lucide-react'
import type { BaseFilterParams, FilterBuilderProps } from '@/types/filtering'

export default function FilterBuilder<T extends BaseFilterParams>({
  config,
  filters,
  searchTerm,
  showFilters,
  onFilterChange,
  onFiltersChange,
  onSearchChange,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  isLoading = false
}: FilterBuilderProps<T>) {
  const { fields, quickFilters, searchConfig } = config

  // Render input based on field type
  const renderFilterInput = (field: typeof fields[0]) => {
    const value = filters[field.key]

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onFilterChange(field.key, e.target.value || undefined)}
            placeholder={field.placeholder}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        )

      case 'number':
        return (
          <div className="relative">
            {field.icon === 'dollar' && (
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            )}
            <input
              type="number"
              step={field.validation?.min !== undefined ? "0.01" : "1"}
              min={field.validation?.min}
              max={field.validation?.max}
              value={(value as number) ?? ''}
              onChange={(e) => onFilterChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
              placeholder={field.placeholder}
              className={`w-full rounded-lg border border-slate-200 bg-white py-2 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                field.icon === 'dollar' ? 'pl-9' : 'pl-4'
              }`}
            />
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onFilterChange(field.key, e.target.value || undefined)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        )

      case 'select': {
        const options = Array.isArray(field.options) ? field.options : []
        return (
          <select
            value={(value as string | number) || ''}
            onChange={(e) => onFilterChange(field.key, e.target.value || undefined)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">{field.placeholder || `All ${field.label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      }

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) => onFilterChange(field.key, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600">{field.label}</span>
          </label>
        )

      case 'dateRange': {
        if (!field.rangeConfig) return null
        const { startKey, endKey, startLabel, endLabel } = field.rangeConfig
        return (
          <div className="grid gap-2 grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{startLabel}</label>
              <input
                type="date"
                value={(filters[startKey] as string) || ''}
                onChange={(e) => onFilterChange(startKey, e.target.value || undefined)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{endLabel}</label>
              <input
                type="date"
                value={(filters[endKey] as string) || ''}
                onChange={(e) => onFilterChange(endKey, e.target.value || undefined)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )
      }

      case 'numberRange': {
        if (!field.rangeConfig) return null
        const { startKey: minKey, endKey: maxKey, startLabel: minLabel, endLabel: maxLabel } = field.rangeConfig
        return (
          <div className="grid gap-2 grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{minLabel}</label>
              <div className="relative">
                {field.icon === 'dollar' && (
                  <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type="number"
                  step="0.01"
                  value={(filters[minKey] as number) ?? ''}
                  onChange={(e) => onFilterChange(minKey, e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0.00"
                  className={`w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    field.icon === 'dollar' ? 'pl-7' : 'pl-3'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{maxLabel}</label>
              <div className="relative">
                {field.icon === 'dollar' && (
                  <DollarSign className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type="number"
                  step="0.01"
                  value={(filters[maxKey] as number) ?? ''}
                  onChange={(e) => onFilterChange(maxKey, e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0.00"
                  className={`w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    field.icon === 'dollar' ? 'pl-7' : 'pl-3'
                  }`}
                />
              </div>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(key => {
    if (key === 'page' || key === 'size' || key === 'sortBy' || key === 'sortDirection') return false
    const val = filters[key as keyof T]
    return val !== undefined && val !== null && val !== ''
  }).length

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle Row */}
      <div className="flex gap-4">
        {/* Search Input */}
        {searchConfig?.enabled && (
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchConfig.placeholder || 'Search...'}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
          </div>
        )}

        {/* Filter Toggle Button */}
        <button
          onClick={onToggleFilters}
          disabled={isLoading}
          className={`flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors disabled:opacity-50 ${
            showFilters || hasActiveFilters
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Filter className="h-5 w-5" />
              Filters
            </h3>
            <button
              onClick={onToggleFilters}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Filters */}
          {quickFilters && quickFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {quickFilters.map((quickFilter, index) => (
                <button
                  key={index}
                  onClick={() => onFiltersChange(quickFilter.getFilters())}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
                >
                  {quickFilter.label}
                </button>
              ))}
            </div>
          )}

          {/* Filter Fields Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <div
                key={String(field.key)}
                className={field.colSpan ? `md:col-span-${field.colSpan}` : ''}
              >
                <label htmlFor={String(field.key)} className="mb-2 block text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                {renderFilterInput(field)}
              </div>
            ))}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 p-3">
              <div className="text-sm text-indigo-900">
                <span className="font-medium">Active filters applied</span>
              </div>
              <button
                onClick={onClearFilters}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
