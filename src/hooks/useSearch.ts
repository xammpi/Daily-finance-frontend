/**
 * useSearch Hook
 *
 * A React hook for managing criteria-based search with pagination and sorting.
 * Works with the POST-based search API using SearchCriteria arrays.
 *
 * @example
 * ```typescript
 * const { data, isLoading, setCriteria, setPage, search } = useSearch({
 *   searchFn: expensesApi.search,
 *   initialRequest: {
 *     criteria: [],
 *     page: 0,
 *     size: 10,
 *     sortBy: 'date',
 *     sortOrder: 'DESC'
 *   }
 * })
 *
 * // Add criteria using CriteriaBuilder
 * const builder = new CriteriaBuilder()
 *   .equals('categoryId', 5)
 *   .between('amount', 100, 500)
 *
 * setCriteria(builder.build())
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import type { SearchRequest, SearchCriteria, PaginatedResponse } from '@/types'

export interface UseSearchOptions<T> {
  /**
   * API function to perform search
   * Should accept SearchRequest and return PaginatedResponse<T>
   */
  searchFn: (request: SearchRequest) => Promise<PaginatedResponse<T>>

  /**
   * Initial search request
   */
  initialRequest: SearchRequest

  /**
   * Auto-execute search on mount and request changes
   * Default: true
   */
  autoSearch?: boolean

  /**
   * Debounce delay in milliseconds
   * Useful for search-as-you-type scenarios
   * Default: 0 (no debounce)
   */
  debounceDelay?: number

  /**
   * Callback when search succeeds
   */
  onSuccess?: (data: PaginatedResponse<T>) => void

  /**
   * Callback when search fails
   */
  onError?: (error: Error) => void
}

export interface UseSearchReturn<T> {
  // Data state
  data: PaginatedResponse<T> | null
  isLoading: boolean
  error: string | null

  // Request state
  request: SearchRequest
  criteria: SearchCriteria[]

  // Actions
  search: () => Promise<void>
  setCriteria: (criteria: SearchCriteria[]) => void
  addCriterion: (criterion: SearchCriteria) => void
  removeCriterion: (index: number) => void
  clearCriteria: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (sortBy: string, sortOrder?: 'ASC' | 'DESC') => void
  updateRequest: (updates: Partial<SearchRequest>) => void

  // Computed
  hasResults: boolean
  isEmpty: boolean
  hasCriteria: boolean
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

/**
 * Hook for managing criteria-based search
 */
export function useSearch<T>(options: UseSearchOptions<T>): UseSearchReturn<T> {
  const {
    searchFn,
    initialRequest,
    autoSearch = true,
    debounceDelay = 0,
    onSuccess,
    onError
  } = options

  // State
  const [data, setData] = useState<PaginatedResponse<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<SearchRequest>(initialRequest)

  // Perform search
  const search = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await searchFn(request)
      setData(result)
      onSuccess?.(result)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Search failed'
      setError(errorMessage)
      onError?.(err)
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchFn, request, onSuccess, onError])

  // Auto-search on request changes
  useEffect(() => {
    if (autoSearch) {
      if (debounceDelay > 0) {
        const timer = setTimeout(search, debounceDelay)
        return () => clearTimeout(timer)
      } else {
        search()
      }
    }
  }, [autoSearch, search, debounceDelay])

  // Criteria management
  const setCriteria = useCallback((criteria: SearchCriteria[]) => {
    setRequest(prev => ({
      ...prev,
      criteria,
      page: 0 // Reset to first page when criteria changes
    }))
  }, [])

  const addCriterion = useCallback((criterion: SearchCriteria) => {
    setRequest(prev => ({
      ...prev,
      criteria: [...prev.criteria, criterion],
      page: 0
    }))
  }, [])

  const removeCriterion = useCallback((index: number) => {
    setRequest(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
      page: 0
    }))
  }, [])

  const clearCriteria = useCallback(() => {
    setRequest(prev => ({
      ...prev,
      criteria: [],
      page: 0
    }))
  }, [])

  // Pagination
  const setPage = useCallback((page: number) => {
    setRequest(prev => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((size: number) => {
    setRequest(prev => ({ ...prev, size, page: 0 }))
  }, [])

  // Sorting
  const setSort = useCallback((sortBy: string, sortOrder: 'ASC' | 'DESC' = 'DESC') => {
    setRequest(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 0
    }))
  }, [])

  // General request update
  const updateRequest = useCallback((updates: Partial<SearchRequest>) => {
    setRequest(prev => ({ ...prev, ...updates }))
  }, [])

  // Computed values
  const hasResults = data !== null && data.content.length > 0
  const isEmpty = data !== null && data.content.length === 0
  const hasCriteria = request.criteria.length > 0
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0
  const currentPage = data?.currentPage ?? request.page ?? 0
  const pageSize = data?.pageSize ?? request.size ?? 10

  return {
    // Data state
    data,
    isLoading,
    error,

    // Request state
    request,
    criteria: request.criteria,

    // Actions
    search,
    setCriteria,
    addCriterion,
    removeCriterion,
    clearCriteria,
    setPage,
    setPageSize,
    setSort,
    updateRequest,

    // Computed
    hasResults,
    isEmpty,
    hasCriteria,
    totalPages,
    totalElements,
    currentPage,
    pageSize
  }
}
