import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingDown,
  Calendar,
  ArrowRight,
  Plus,
  Receipt,
  AlertCircle
} from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { useBalance } from '@/hooks/useBalance'
import Layout from '@/components/Layout'
import TransactionModal from '@/components/TransactionModal.tsx'
import { formatCurrency, formatDateShort } from '@/utils'
import type { ExpenseStatistics } from '@/types'
import { Transaction } from '@/types/transaction.ts'

export default function DashboardPage() {
  const { wallet, refresh: refreshBalance, isLoading: isBalanceLoading } = useBalance()
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<ExpenseStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [expensesData, stats] = await Promise.all([
        transactionApi.getAll(),
        transactionApi.getStatistics(),
      ])
      setExpenses(expensesData.slice(0, 5))
      setStatistics(stats)
    }  finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleModalSuccess = async () => {
    await Promise.all([
      fetchDashboardData(),
      refreshBalance()
    ])
  }

  // Show loading state if either wallet or dashboard data is loading
  const isPageLoading = isLoading || isBalanceLoading

  if (isPageLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout onAddTransaction={handleOpenModal}>
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
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg transition-transform hover:scale-105">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium opacity-90">Current Balance</span>
              </div>
              <p className="text-3xl font-bold">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      wallet?.amount || 0,
                      wallet?.currency?.code
                    )}
              </p>
              <p className="mt-2 text-xs opacity-75">
                {wallet?.totalExpenses || 0} expenses • {wallet?.totalDeposits || 0} deposits
              </p>
            </div>
          </div>

          {/* Today Expenses Card */}
          <Link
            to="/expenses"
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-50" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">Today</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.todayExpenses || 0,
                      wallet?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-2 text-sm text-slate-500">Spent today</p>
            </div>
          </Link>

          {/* Week Expenses Card */}
          <Link
            to="/expenses"
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-50" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">This Week</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.weekExpenses || 0,
                      wallet?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-2 text-sm text-slate-500">Weekly spending</p>
            </div>
          </Link>

          {/* Monthly Expenses Card */}
          <Link
            to="/expenses"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 p-6 text-white shadow-lg transition-all hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium opacity-90">This Month</span>
              </div>
              <p className="text-3xl font-bold">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.monthExpenses || 0,
                      wallet?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-2 text-xs opacity-75">
                Avg: {isLoading ? '...' : formatCurrency(statistics?.averageDailyExpenses || 0, wallet?.currency?.code || 'USD')}/day
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Expenses */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <Receipt className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Expenses</h2>
                <p className="text-sm text-slate-500">Your latest transactions</p>
              </div>
            </div>
            <Link
              to="/expenses"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Receipt className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mb-2 text-lg font-medium text-slate-900">No expenses yet</p>
              <p className="mb-4 text-sm text-slate-500">
                Start tracking your expenses to see them here
              </p>
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateShort(expense.date)}
                        <span>•</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                          {expense.categoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      -{formatCurrency(expense.amount, wallet?.currency?.code || 'USD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
      />
    </Layout>
  )
}
