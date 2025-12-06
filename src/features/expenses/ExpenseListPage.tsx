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
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { expensesApi } from '@/api/expenses'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'
import ExpenseModal from '@/components/ExpenseModal'
import { formatCurrency, formatDateForDisplay, getCurrentMonthRange, getCurrentWeekRange, getTodayDate } from '@/utils'
import { CriteriaBuilder } from '@/utils/CriteriaBuilder'
import type { Expense, Category, PaginatedResponse, ExpenseFilterParams } from '@/types'

export default function ExpenseListPage() {
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Expense> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<ExpenseFilterParams>({
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

  // Text search (client-side on results)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [filters.categoryId, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, filters.page, filters.size, sortBy, sortOrder])

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert filters to SearchRequest with criteria
      const builder = new CriteriaBuilder()

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

      const data = await expensesApi.search(searchRequest)
      setPaginatedData(data)
    } catch (err) {
      setError('Failed to load expenses')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await expensesApi.delete(id)
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenModal = (expenseId?: number) => {
    setEditingExpenseId(expenseId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExpenseId(undefined)
  }

  const handleModalSuccess = () => {
    fetchExpenses()
  }

  const handleQuickFilter = (filter: 'today' | 'week' | 'month' | 'all') => {
    switch (filter) {
      case 'today':
        { const today = getTodayDate()
        setFilters(prev => ({ ...prev, startDate: today, endDate: today, page: 0 }))
        setShowFilters(true)
        break }
      case 'week':
        { const weekRange = getCurrentWeekRange()
        setFilters(prev => ({ ...prev, startDate: weekRange.startDate, endDate: weekRange.endDate, page: 0 }))
        setShowFilters(true)
        break }
      case 'month':
        { const monthRange = getCurrentMonthRange()
        setFilters(prev => ({ ...prev, startDate: monthRange.startDate, endDate: monthRange.endDate, page: 0 }))
        setShowFilters(true)
        break }
      case 'all':
        clearFilters()
        break
    }
  }

  const clearFilters = () => {
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
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newSize: number) => {
    setFilters(prev => ({ ...prev, size: newSize, page: 0 }))
  }

  // Client-side text search on current page results
  const expenses = paginatedData?.content || []
  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group expenses by date
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = formatDateForDisplay(expense.date)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
    return groups
  }, {} as Record<string, Expense[]>)

  const hasActiveFilters = filters.categoryId || filters.startDate || filters.endDate ||
    filters.minAmount !== undefined || filters.maxAmount !== undefined

  if (isLoading && !paginatedData) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-slate-600">Loading expenses...</p>
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
    <Layout onAddExpense={() => handleOpenModal()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
            <p className="mt-1 text-slate-600">
              {paginatedData?.totalElements || 0} total expense{paginatedData?.totalElements !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Add Expense
          </button>
        </div>

        {/* Search and Filter Button */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
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
                  {[filters.categoryId, filters.startDate, filters.minAmount].filter(Boolean).length}
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
                  Filter Expenses
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
                    onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined, page: 0 }))}
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
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || undefined, page: 0 }))}
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
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
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
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
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

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mb-2 text-lg font-medium text-slate-900">No expenses found</p>
            <p className="mb-6 text-slate-500">
              {searchTerm || hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first expense'}
            </p>
            {!searchTerm && !hasActiveFilters && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                Create Your First Expense
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {date}
                  </div>
                  <div className="space-y-3">
                    {dateExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{expense.description}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                                {expense.categoryName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenModal(expense.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
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
                    {expenses.length} of {paginatedData.totalElements} expenses
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

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        expenseId={editingExpenseId}
      />
    </Layout>
  )
}
