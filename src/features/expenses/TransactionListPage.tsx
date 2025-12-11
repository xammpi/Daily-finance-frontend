import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Receipt,
  Calendar,
  TrendingDown,
  TrendingUp,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'
import TransactionModal from '@/components/TransactionModal.tsx'
import ConfirmDialog from '@/components/ConfirmDialog'
import Pagination from '@/components/Pagination'
import { formatCurrency, formatDateForDisplay, getCurrentMonthRange, getCurrentWeekRange, getTodayDate, extractErrorMessage } from '@/utils'
import { CriteriaBuilder } from '@/utils/CriteriaBuilder'
import { useDelayedLoading, useDebounce } from '@/hooks'
import type { PaginatedResponse } from '@/types'
import { Transaction } from '@/types'
import { Category, CategoryType } from '@/types'
import { toast } from '@/lib/toast'
import { SEARCH_DEBOUNCE_DELAY_MS, SEARCH_MIN_CHARACTERS, DEFAULT_PAGE_SIZE_TRANSACTIONS } from '@/constants'

import { logger } from '@/utils/logger'
// Local filter interface for transaction filtering
interface TransactionFilterParams {
  categoryId?: number
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  size?: number
}

export default function TransactionListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Transaction> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState<number | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; description: string } | null>(null)
  const [isUrlProcessed, setIsUrlProcessed] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<TransactionFilterParams>({
    categoryId: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    page: 0,
    size: DEFAULT_PAGE_SIZE_TRANSACTIONS
  })

  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'categoryName'>('date')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

  // Text search state
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_DELAY_MS)

  // Apply filter from URL parameter on mount
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    const categoryParam = searchParams.get('category')

    let updatedFilters: Partial<TransactionFilterParams> = {}

    // Handle date filter
    if (filterParam) {
      let dateRange: { startDate: string; endDate: string } | null = null

      switch (filterParam) {
        case 'today': {
          const today = getTodayDate()
          dateRange = { startDate: today, endDate: today }
          break
        }
        case 'week':
          dateRange = getCurrentWeekRange()
          break
        case 'month':
          dateRange = getCurrentMonthRange()
          break
      }

      if (dateRange) {
        updatedFilters.startDate = dateRange.startDate
        updatedFilters.endDate = dateRange.endDate
      }

      // Remove the filter param from URL after applying
      searchParams.delete('filter')
    }

    // Handle category filter
    if (categoryParam) {
      const categoryId = Number(categoryParam)
      if (!isNaN(categoryId)) {
        updatedFilters.categoryId = categoryId
      }
      // Remove the category param from URL after applying
      searchParams.delete('category')
    }

    // Apply filters if any (use callback form to avoid race condition)
    if (Object.keys(updatedFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...updatedFilters
      }))
      setShowFilters(true)
    }

    // Update URL if we removed params
    if (filterParam || categoryParam) {
      setSearchParams(searchParams, { replace: true })
    }

    // Mark URL params as processed to allow fetching
    setIsUrlProcessed(true)
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
      logger.error('Failed to fetch categories', err)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert filters to SearchRequest with criteria
      const builder = new CriteriaBuilder()

      // Add text search on description if search term exists
      if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= SEARCH_MIN_CHARACTERS) {
        builder.like('description', debouncedSearchTerm.trim())
      }

      if (filters.categoryId) {
        builder.equals('categoryId', filters.categoryId)
      }

      if (filters.startDate && filters.endDate) {
        builder.dateRange('date', filters.startDate, filters.endDate)
      } else if (filters.startDate) {
        builder.add('date', 'GREATER_THAN_OR_EQUAL', filters.startDate)
      } else if (filters.endDate) {
        builder.add('date', 'LESS_THAN_OR_EQUAL', filters.endDate)
      }

      if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
        builder.amountRange('amount', filters.minAmount, filters.maxAmount)
      } else if (filters.minAmount !== undefined) {
        builder.minAmount('amount', filters.minAmount)
      } else if (filters.maxAmount !== undefined) {
        builder.maxAmount('amount', filters.maxAmount)
      }

      const searchRequest = builder.buildRequest({
        page: filters.page ?? 0,
        size: filters.size ?? DEFAULT_PAGE_SIZE_TRANSACTIONS,
        sortBy: sortBy,
        sortOrder: sortOrder
      })

      const data = await transactionApi.search(searchRequest)
      setPaginatedData(data)
    } catch (err) {
      // Ignore abort errors (component unmounted or new request started)
      if (err instanceof Error && err.name === 'CanceledError') {
        return
      }
      setError('Failed to load transactions')
      logger.error('Error occurred', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters.categoryId, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, filters.page, filters.size, sortBy, sortOrder, debouncedSearchTerm])

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  // Only fetch transactions after URL params have been processed
  useEffect(() => {
    // Don't fetch until URL params are processed
    if (!isUrlProcessed) return

    // Create AbortController for request cancellation
    const abortController = new AbortController()

    // Fetch transactions with current filters
    void fetchTransactions()

    // Cleanup: abort any pending requests when effect re-runs or component unmounts
    return () => {
      abortController.abort()
    }
  }, [isUrlProcessed, fetchTransactions])

  const handleDelete = (id: number, description: string) => {
    setDeleteTarget({ id, description })
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    // Optimistic update: immediately remove from UI
    const previousData = paginatedData
    if (paginatedData) {
      const updatedContent = paginatedData.content.filter(t => t.id !== deleteTarget.id)
      setPaginatedData({
        ...paginatedData,
        content: updatedContent,
        totalElements: paginatedData.totalElements - 1
      })
    }

    try {
      await transactionApi.delete(deleteTarget.id)
      toast.success('Transaction deleted successfully')
      // Refresh to get accurate data from server
      await fetchTransactions()
    } catch (err) {
      logger.error('Failed to delete transaction', err)
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)

      // Rollback optimistic update on error
      if (previousData) {
        setPaginatedData(previousData)
      }
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleOpenModal = (transactionId?: number) => {
    setEditingTransactionId(transactionId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransactionId(undefined)
  }

  const handleModalSuccess = async () => {
    await fetchTransactions()
  }

  const handleQuickFilter = (filter: 'today' | 'week' | 'month' | 'all') => {
    switch (filter) {
      case 'today':
        { const today = getTodayDate()
        setFilters((prev: TransactionFilterParams) => ({ ...prev, startDate: today, endDate: today, page: 0 }))
        setShowFilters(true)
        break }
      case 'week':
        { const weekRange = getCurrentWeekRange()
        setFilters((prev: TransactionFilterParams) => ({ ...prev, startDate: weekRange.startDate, endDate: weekRange.endDate, page: 0 }))
        setShowFilters(true)
        break }
      case 'month':
        { const monthRange = getCurrentMonthRange()
        setFilters((prev: TransactionFilterParams) => ({ ...prev, startDate: monthRange.startDate, endDate: monthRange.endDate, page: 0 }))
        setShowFilters(true)
        break }
      case 'all':
        clearFilters()
        break
    }
  }

  const clearFilters = () => {
    setSearchTerm('') // useDebounce hook will automatically update debouncedSearchTerm
    setFilters({
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      page: 0,
      size: filters.size
    })
    setShowFilters(false)
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev: TransactionFilterParams) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize: number) => {
    setFilters((prev: TransactionFilterParams) => ({ ...prev, size: newSize, page: 0 }))
  }

  // Get transactions from paginated data (filtering is done by backend)
  const transactions = paginatedData?.content || []

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = formatDateForDisplay(transaction.date)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  const hasActiveFilters = (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2) ||
    filters.categoryId || filters.startDate || filters.endDate ||
    filters.minAmount !== undefined || filters.maxAmount !== undefined

  // Use delayed loading to prevent flash of loading spinner for fast operations
  // But always wait for initial data load
  const shouldShowLoading = isLoading && !paginatedData
  const showDelayedLoading = useDelayedLoading(shouldShowLoading)

  // Show loading state if we're waiting for initial data or if delayed loading threshold is reached
  if (shouldShowLoading && (showDelayedLoading || !paginatedData)) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" aria-hidden="true" />
            <p className="text-slate-600">Loading transactions...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center" role="alert" aria-live="assertive">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100" aria-hidden="true">
              <Receipt className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout onAddTransaction={() => handleOpenModal()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-8 text-white shadow-2xl">
          {/* Decorative Circles */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Receipt className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Transactions</h1>
                <p className="mt-1 text-sm text-white/90">
                  {paginatedData?.totalElements || 0} total transaction{paginatedData?.totalElements !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Button */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search transactions (min 2 characters)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setFilters((prev: TransactionFilterParams) => ({ ...prev, page: 0 }))
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Search transactions by description, category, or amount"
              />
              {searchTerm.trim() && searchTerm.trim().length < 2 && (
                <div className="absolute left-0 top-full mt-1 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-700 shadow-sm">
                  Enter at least 2 characters to search
                </div>
              )}
            </div>

            {/* Filter and Sort Controls - Horizontal Scroll on Mobile */}
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:overflow-x-visible md:px-0">
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-4 py-3 font-medium transition-colors md:px-6 ${
                    showFilters || hasActiveFilters
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="h-5 w-5" />
                  <span className="whitespace-nowrap">Filters</span>
                  {hasActiveFilters && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                      {[
                        debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2 ? debouncedSearchTerm : null,
                        filters.categoryId,
                        filters.startDate,
                        filters.minAmount
                      ].filter(Boolean).length}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'categoryName')}
                  className="flex-shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:px-4"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="categoryName">Sort by Category</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 md:px-4"
                  title={sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'ASC' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Filter className="h-5 w-5" />
                  Filter Transactions
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Filter Buttons - Horizontal Scroll on Mobile */}
              <div className="mb-4 -mx-6 overflow-x-auto px-6 scrollbar-hide">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickFilter('today')}
                    className="flex-shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleQuickFilter('week')}
                    className="flex-shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => handleQuickFilter('month')}
                    className="flex-shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => handleQuickFilter('all')}
                    className="flex-shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    All Time
                  </button>
                </div>
              </div>

              {/* Filter Inputs */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Category Filter */}
                <div>
                  <label htmlFor="categoryFilter" className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    id="categoryFilter"
                    value={filters.categoryId || ''}
                    onChange={(e) => setFilters((prev: TransactionFilterParams) => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={filters.startDate || ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters((prev: TransactionFilterParams) => ({ ...prev, startDate: e.target.value || undefined, page: 0 }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-slate-700">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={filters.endDate || ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters((prev: TransactionFilterParams) => ({ ...prev, endDate: e.target.value || undefined, page: 0 }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Min Amount */}
                <div>
                  <label htmlFor="minAmount" className="mb-2 block text-sm font-medium text-slate-700">
                    Min Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="minAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={filters.minAmount ?? ''}
                      onChange={(e) => setFilters((prev: TransactionFilterParams) => ({ ...prev, minAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Max Amount */}
                <div>
                  <label htmlFor="maxAmount" className="mb-2 block text-sm font-medium text-slate-700">
                    Max Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="maxAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={filters.maxAmount ?? ''}
                      onChange={(e) => setFilters((prev: TransactionFilterParams) => ({ ...prev, maxAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Page Size */}
                <div>
                  <label htmlFor="pageSize" className="mb-2 block text-sm font-medium text-slate-700">
                    Per Page
                  </label>
                  <select
                    id="pageSize"
                    value={filters.size}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display & Clear */}
              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 p-3">
                  <div className="text-sm text-indigo-900">
                    <span className="font-medium">Active filters applied</span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-16 text-center shadow-xl">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20" />

            <div className="relative">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
                <Receipt className="h-12 w-12 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">No transactions found</h3>
              <p className="mb-8 text-base text-slate-600">
                {searchTerm || hasActiveFilters
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                  : 'Start tracking your finances by creating your first transaction'}
              </p>
              {!searchTerm && !hasActiveFilters && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Transaction
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                    <Calendar className="h-4 w-4" />
                    {date}
                  </div>
                  <div className="space-y-3">
                    {dateTransactions.map((transaction) => {
                      const isIncome = transaction.categoryType === CategoryType.INCOME
                      const TypeIcon = isIncome ? TrendingUp : TrendingDown

                      return (
                        <div
                          key={transaction.id}
                          className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                          {/* Gradient Side Bar */}
                          <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${
                            isIncome ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-orange-600'
                          }`} />

                          <div className="flex flex-col gap-3 p-5 pl-6 md:flex-row md:items-center md:justify-between md:gap-4">
                            {/* Icon and description section */}
                            <div className="flex items-center gap-3 md:gap-4">
                              {/* Icon with Gradient Background */}
                              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg md:h-14 md:w-14 ${
                                isIncome ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-orange-600'
                              }`}>
                                <TypeIcon className="h-6 w-6 text-white md:h-7 md:w-7" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-bold text-slate-900 md:text-lg">{transaction.description}</p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 md:gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateForDisplay(transaction.date)}
                                  <span className="hidden md:inline">•</span>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                                    isIncome
                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                      : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                  }`}>
                                    <TypeIcon className="h-3 w-3" />
                                    {transaction.categoryName}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Amount and action buttons section */}
                            <div className="flex items-center justify-between gap-2 md:gap-4">
                              <div className="flex-1 md:text-right">
                                <p className={`text-xl font-bold md:text-2xl ${
                                  isIncome ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                  {isIncome ? '+' : '-'}
                                  {formatCurrency(transaction.amount)}
                                </p>
                              </div>

                              <div className="flex gap-1.5 md:gap-2">
                                <button
                                  onClick={() => handleOpenModal(transaction.id)}
                                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transition-all hover:scale-110 hover:shadow-lg md:h-10 md:w-10 md:rounded-xl"
                                  aria-label={`Edit ${transaction.description} transaction`}
                                  title="Edit transaction"
                                >
                                  <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => handleDelete(transaction.id, transaction.description)}
                                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 border-red-200 bg-red-50 text-red-600 transition-all hover:border-red-300 hover:bg-red-100 md:h-10 md:w-10 md:rounded-xl"
                                  aria-label={`Delete ${transaction.description} transaction`}
                                  title="Delete transaction"
                                >
                                  <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Decorative Elements */}
                          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-white/50 to-white/0" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {paginatedData && paginatedData.totalPages > 1 && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-center">
                  <Pagination
                    currentPage={paginatedData.currentPage}
                    totalPages={paginatedData.totalPages}
                    onPageChange={handlePageChange}
                    isFirst={paginatedData.first}
                    isLast={paginatedData.last}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">
                    Page {paginatedData.currentPage + 1} of {paginatedData.totalPages}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    {transactions.length} of {paginatedData.totalElements} transactions
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        transactionId={editingTransactionId}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction?\n\n"${deleteTarget?.description}"\n\nThis action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="danger"
      />
    </Layout>
  )
}
