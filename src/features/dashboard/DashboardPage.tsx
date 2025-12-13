import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  Receipt,
  AlertCircle,
  Edit2,
  Trash2,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { useBalance } from '@/hooks/useBalance'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { useCategoryStatistics } from '@/hooks'
import Layout from '@/components/Layout'
import TransactionModal from '@/components/TransactionModal.tsx'
import ConfirmDialog from '@/components/ConfirmDialog'
import { formatCurrency, formatDateShort, extractErrorMessage } from '@/utils'
import type { TransactionStatistics } from '@/types'
import { Transaction } from '@/types'
import { CategoryType } from '@/types'
import { toast } from '@/lib/toast'
import { logger } from '@/utils/logger'
import { CategoryPieChart, TrendLineChart } from '@/components'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { wallet, refresh: refreshBalance, isLoading: isBalanceLoading } = useBalance()
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState<number | undefined>(undefined)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; description: string } | null>(null)

  // Statistics state
  const [statsPeriod, setStatsPeriod] = useState<'MONTH' | 'YEAR'>('MONTH')

  // Fetch category statistics
  const {
    categoryStats,
    trends,
    summary,
    isLoading: isStatsLoading,
    error: statsError
  } = useCategoryStatistics(undefined, statsPeriod)

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [expensesData, stats] = await Promise.all([
        transactionApi.getAll(),
        transactionApi.getStatistics(),
      ])

      setExpenses(expensesData.slice(0, 5))
      setStatistics(stats)
    } catch (error) {
      logger.error('Failed to fetch dashboard data', error)
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage || 'Failed to load dashboard data. Please check if the backend is running.')
      setExpenses([])
      setStatistics(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboardData()
  }, [fetchDashboardData])

  const handleOpenModal = (transactionId?: number) => {
    setEditingTransactionId(transactionId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransactionId(undefined)
  }

  const handleModalSuccess = async () => {
    await Promise.all([
      fetchDashboardData(),
      refreshBalance()
    ])
  }

  const handleDelete = (id: number, description: string) => {
    setDeleteTarget({ id, description })
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    // Optimistic update: immediately remove from UI
    const previousExpenses = expenses
    setExpenses(expenses.filter(e => e.id !== deleteTarget.id))

    try {
      await transactionApi.delete(deleteTarget.id)
      toast.success('Transaction deleted successfully')

      // Refresh data from server
      await Promise.all([
        fetchDashboardData(),
        refreshBalance()
      ])
    } catch (err) {
      logger.error('Failed to delete transaction', err)
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)

      // Rollback optimistic update on error
      setExpenses(previousExpenses)
    } finally {
      setDeleteTarget(null)
    }
  }

  // Show loading state if either wallet or dashboard data is loading
  const isPageLoading = isLoading || isBalanceLoading

  // Use delayed loading to prevent flash of loading spinner for fast operations
  // But always wait for initial data load
  const showDelayedLoading = useDelayedLoading(isPageLoading)

  // Show loading if still loading AND either delay passed OR we have no data yet
  if (isPageLoading && (showDelayedLoading || !wallet || !statistics)) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" aria-hidden="true" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout onAddTransaction={() => handleOpenModal()}>
      <div className="space-y-6">
        {/* Low Balance Warning */}
        {wallet?.lowBalanceWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Low Balance Warning</p>
              <p className="mt-1 text-sm text-orange-600">
                Your balance is below {wallet.currency.symbol}100. Consider adding funds to continue
                tracking expenses.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Balance Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold opacity-90">Current Balance</span>
              </div>
              <p className="truncate text-xl font-bold leading-tight lg:text-2xl">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      wallet?.amount || 0,
                      wallet?.currency?.code
                    )}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium opacity-90">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {wallet?.totalExpenses || 0} expenses
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {wallet?.totalDeposits || 0} deposits
                </span>
              </div>
            </div>
          </div>

          {/* Today Expenses Card */}
          <Link
            to="/transactions?filter=today"
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-50" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-blue-50/50" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Today</span>
              </div>
              <p className="truncate text-xl font-bold leading-tight text-slate-900 lg:text-2xl">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.todayExpenses || 0,
                      wallet?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-500">Spent today</p>
            </div>
          </Link>

          {/* Week Expenses Card */}
          <Link
            to="/transactions?filter=week"
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-50" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-orange-50/50" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-600">This Week</span>
              </div>
              <p className="truncate text-xl font-bold leading-tight text-slate-900 lg:text-2xl">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.weekExpenses || 0,
                      wallet?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-500">Weekly spending</p>
            </div>
          </Link>

          {/* Monthly Expenses Card */}
          <Link
            to="/transactions?filter=month"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold opacity-90">This Month</span>
              </div>
              <p className="truncate text-xl font-bold leading-tight lg:text-2xl">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.monthExpenses || 0,
                      wallet?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-3 text-xs font-medium opacity-90">
                Avg: {isLoading ? '...' : formatCurrency(statistics?.averageDailyExpenses || 0, wallet?.currency?.code || 'USD')}/day
              </p>
            </div>
          </Link>
        </div>

        {/* Statistics Section */}
        {!isStatsLoading && categoryStats && summary && (
          <div className="space-y-6">
            {/* Period Toggle */}
            <div className="flex justify-end">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <button
                  onClick={() => setStatsPeriod('MONTH')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statsPeriod === 'MONTH'
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setStatsPeriod('YEAR')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statsPeriod === 'YEAR'
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  This Year
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Pie Chart */}
              <div className="rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <PieChartIcon className="h-5 w-5 text-indigo-600" />
                  Category Distribution
                </h3>
                <CategoryPieChart
                  data={categoryStats.categories}
                  currencySymbol={categoryStats.currency.symbol}
                />
                <p className="mt-4 text-center text-sm text-slate-600">
                  Total: {categoryStats.currency.symbol}{categoryStats.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Trends Line Chart */}
              {trends && (
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Spending Trends
                  </h3>
                  <TrendLineChart
                    data={trends.dataPoints}
                    currencySymbol={trends.currency.symbol}
                    showIncome={true}
                    showExpenses={true}
                  />
                </div>
              )}
            </div>

            {/* Top Categories List */}
            <div className="rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Top Spending Categories
              </h3>
              <div className="space-y-3">
                {categoryStats.categories.slice(0, 5).map((category, index) => (
                  <div
                    key={category.categoryId}
                    onClick={() => navigate(`/transactions?category=${category.categoryId}`)}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{category.categoryName}</p>
                        <p className="text-sm text-slate-600">
                          {category.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {categoryStats.currency.symbol}{category.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-indigo-600">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isStatsLoading && (
          <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="text-slate-600">Loading statistics...</p>
            </div>
          </div>
        )}

        {statsError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">{statsError}</p>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                  <p className="text-sm text-white/80">Your latest activity</p>
                </div>
              </div>
              <Link
                to="/transactions"
                className="flex items-center gap-1 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <p className="text-slate-600">Loading transactions...</p>
              </div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <Receipt className="h-10 w-10 text-slate-400" />
              </div>
              <p className="mb-2 text-lg font-bold text-slate-900">No transactions yet</p>
              <p className="mb-6 text-sm text-slate-500">
                Start tracking your finances to see them here
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const isIncome = expense.categoryType === CategoryType.INCOME
                const TypeIcon = isIncome ? TrendingUp : TrendingDown

                return (
                  <div
                    key={expense.id}
                    className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Gradient Side Bar */}
                    <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${
                      isIncome ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-orange-600'
                    }`} />

                    <div className="flex flex-col gap-3 pl-1 md:flex-row md:items-center md:justify-between md:gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg md:h-14 md:w-14 ${
                          isIncome ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-orange-600'
                        }`}>
                          <TypeIcon className="h-6 w-6 text-white md:h-7 md:w-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-bold text-slate-900 md:text-lg">{expense.description}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 md:gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateShort(expense.date)}
                            </div>
                            <span className="hidden md:inline">•</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold md:px-3 md:py-1 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            }`}>
                              <TypeIcon className="h-3 w-3" />
                              {expense.categoryName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 md:gap-4">
                        <div className="flex-1 md:text-right">
                          <p className={`text-xl font-bold md:text-2xl ${
                            isIncome ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isIncome ? '+' : '-'}
                            {formatCurrency(expense.amount, wallet?.currency?.code || 'USD')}
                          </p>
                        </div>

                        <div className="flex gap-1.5 md:gap-2">
                          <button
                            onClick={() => handleOpenModal(expense.id)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transition-all hover:scale-110 hover:shadow-lg md:h-10 md:w-10 md:rounded-xl"
                            aria-label={`Edit ${expense.description} transaction`}
                            title="Edit transaction"
                          >
                            <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id, expense.description)}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 border-red-200 bg-red-50 text-red-600 transition-all hover:border-red-300 hover:bg-red-100 md:h-10 md:w-10 md:rounded-xl"
                            aria-label={`Delete ${expense.description} transaction`}
                            title="Delete transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-white/50 to-white/0" />
                  </div>
                )
              })}
            </div>
          )}
          </div>
        </div>
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
