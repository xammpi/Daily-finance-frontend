/**
 * Generic Hook for Filtered, Sorted, and Paginated Data
 *
 * This hook provides a complete solution for managing filtered, sorted,
 * and paginated data for any entity type.
 *
 * @example
 * ```typescript
 * const expenses = useFilteredData({
 *   apiFn: expensesApi.filter,
 *   initialFilters: { page: 0, size: 10 },
 *   searchFields: ['description', 'categoryName']
 * })
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  BaseFilterParams,
  GenericPaginatedResponse,
  UseFilterReturn,
  FilterApiFn,
  SortDirection
} from '@/types/filtering'

export interface UseFilteredDataOptions<T extends BaseFilterParams, E> {
  /**
   * API function to fetch filtered data
   */
  apiFn: FilterApiFn<T, E>

  /**
   * Initial filter values
   */
  initialFilters: T

  /**
   * Fields to search on (client-side)
   */
  searchFields?: (keyof E)[]

  /**
   * Auto-fetch on mount
   */
  autoFetch?: boolean

  /**
   * Debounce delay for filter changes (ms)
   */
  debounceDelay?: number

  /**
   * Callback when data loads successfully
   */
  onSuccess?: (data: GenericPaginatedResponse<E>) => void

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void
}

/**
 * Generic hook for managing filtered, sorted, and paginated data
 */
export function useFilteredData<T extends BaseFilterParams, E>(
  options: UseFilteredDataOptions<T, E>
): UseFilterReturn<T, E> {
  const {
    apiFn,
    initialFilters,
    searchFields = [],
    autoFetch = true,
    debounceDelay = 0,
    onSuccess,
    onError
  } = options

  // State
  const [data, setData] = useState<GenericPaginatedResponse<E> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<T>(initialFilters)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await apiFn(filters)
      setData(result)
      onSuccess?.(result)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load data'
      setError(errorMessage)
      onError?.(err)
      console.error('Filter error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiFn, filters, onSuccess, onError])

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (autoFetch) {
      if (debounceDelay > 0) {
        const timer = setTimeout(fetchData, debounceDelay)
        return () => clearTimeout(timer)
      } else {
        fetchData()
      }
    }
  }, [autoFetch, fetchData, debounceDelay])

  // Filter actions
  const setFilter = useCallback((key: keyof T, value: any) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 0 // Reset to first page on filter change
    }))
  }, [])

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 0
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters)
    setSearchTerm('')
  }, [initialFilters])

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  const setPage = useCallback((page: number) => {
    setFiltersState(prev => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((size: number) => {
    setFiltersState(prev => ({ ...prev, size, page: 0 }))
  }, [])

  const setSort = useCallback((field: string, direction: SortDirection) => {
    setFiltersState(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: direction,
      page: 0
    }))
  }, [])

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).some(key => {
    if (key === 'page' || key === 'size' || key === 'sortBy' || key === 'sortDirection') {
      return false
    }
    const value = filters[key as keyof T]
    return value !== undefined && value !== null && value !== ''
  })

  // Client-side search on current page results
  const filteredData = (data?.content || []).filter(item => {
    if (!searchTerm) return true

    return searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase())
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm)
      }
      return false
    })
  })

  return {
    // Data
    data,
    isLoading,
    error,

    // Filter state
    filters,
    searchTerm,
    showFilters,

    // Actions
    setFilter,
    setFilters,
    clearFilters,
    setSearchTerm,
    toggleFilters,
    setPage,
    setPageSize,
    setSort,
    refresh: fetchData,

    // Computed
    hasActiveFilters,
    filteredData
  }
}
