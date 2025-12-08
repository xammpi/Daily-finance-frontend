import { useState, useEffect } from 'react'
import {
  Receipt,
  Calendar,
  TrendingDown,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'
import TransactionModal from '@/components/TransactionModal.tsx'
import { formatCurrency, formatDateForDisplay, getCurrentMonthRange, getCurrentWeekRange, getTodayDate } from '@/utils'
import { CriteriaBuilder } from '@/utils/CriteriaBuilder'
import type { PaginatedResponse } from '@/types'
import { Transaction } from '@/types/transaction.ts'
import { Category } from '@/types/category.ts'
import { useWallet } from '@/hooks/useWallet.ts'

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
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Transaction> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState<number | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<TransactionFilterParams>({
    categoryId: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    page: 0,
    size: 10
  })

  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'categoryName'>('date')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')

  // Text search state
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchTransactions()
  }, [filters.categoryId, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, filters.page, filters.size, sortBy, sortOrder, debouncedSearchTerm])

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert filters to SearchRequest with criteria
      const builder = new CriteriaBuilder()

      // Add text search on description if search term exists (min 2 chars)
      if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2) {
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
        size: filters.size ?? 10,
        sortBy: sortBy,
        sortOrder: sortOrder
      })

      const data = await transactionApi.search(searchRequest)
      setPaginatedData(data)
    } catch (err) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await transactionApi.delete(id)
      fetchTransactions()
    } catch (err) {
      console.error(err)
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

  const handleModalSuccess = () => {
    fetchTransactions()
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
    setSearchTerm('')
    setDebouncedSearchTerm('')
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

  if (isLoading && !paginatedData) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-slate-600">Loading transactions...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
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
        <div className="flex items-center justify-between">
          <div>
            <p className="mt-1 text-slate-600">
              {paginatedData?.totalElements || 0} total transaction{paginatedData?.totalElements !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search and Filter Button */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions (min 2 characters)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setFilters((prev: TransactionFilterParams) => ({ ...prev, page: 0 }))
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchTerm.trim() && searchTerm.trim().length < 2 && (
                <div className="absolute left-0 top-full mt-1 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-700 shadow-sm">
                  Enter at least 2 characters to search
                </div>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filters
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

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'categoryName')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="categoryName">Sort by Category</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                title={sortOrder === 'ASC' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'ASC' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
              </button>
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

              {/* Quick Filter Buttons */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickFilter('today')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                >
                  Today
                </button>
                <button
                  onClick={() => handleQuickFilter('week')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                >
                  This Week
                </button>
                <button
                  onClick={() => handleQuickFilter('month')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                >
                  This Month
                </button>
                <button
                  onClick={() => handleQuickFilter('all')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  All Time
                </button>
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
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mb-2 text-lg font-medium text-slate-900">No transaction found</p>
            <p className="mb-6 text-slate-500">
              {searchTerm || hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first transaction'}
            </p>
            {!searchTerm && !hasActiveFilters && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6
                 py-3 font-medium text-white transition-colors hover:bg-indigo-700">
                <Plus className="h-5 w-5" />
                Create Your First Transaction
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {date}
                  </div>
                  <div className="space-y-3">
                    {dateTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{transaction.description}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                                {transaction.categoryName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">{formatCurrency(transaction.amount)}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenModal(transaction.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {paginatedData && paginatedData.totalPages > 1 && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">
                    Page {paginatedData.currentPage + 1} of {paginatedData.totalPages}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    {transactions.length} of {paginatedData.totalElements} expenses
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={paginatedData.first}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(paginatedData.currentPage - 1)}
                    disabled={!paginatedData.hasPrevious}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(paginatedData.currentPage + 1)}
                    disabled={!paginatedData.hasNext}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(paginatedData.totalPages - 1)}
                    disabled={paginatedData.last}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
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
    </Layout>
  )
}
