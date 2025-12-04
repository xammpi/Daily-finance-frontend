import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  Receipt
} from 'lucide-react'
import { expensesApi } from '@/api/expenses'
import { statisticsApi } from '@/api/statistics'
import Layout from '@/components/Layout'
import ExpenseModal from '@/components/ExpenseModal'
import type { Expense, StatisticsResponse } from '@/types'

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [expensesData, stats] = await Promise.all([
        expensesApi.getAll(),
        statisticsApi.getOverall(),
      ])
      setExpenses(expensesData.slice(0, 5))
      setStatistics(stats)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleModalSuccess = () => {
    fetchDashboardData()
  }

  return (
    <Layout onAddExpense={handleOpenModal}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
          <p className="mt-1 text-slate-600">Here's what's happening with your money</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-4xl font-bold">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.currentBalance || 0,
                      statistics?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-2 text-sm opacity-75">{statistics?.currency?.code || 'USD'}</p>
            </div>
          </div>

          {/* Monthly Expenses Card */}
          <Link
            to="/expenses"
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-50" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium text-slate-600">This Month</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.totalExpensesThisMonth || 0,
                      statistics?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-2 text-sm text-slate-500">Total expenses</p>
            </div>
          </Link>

          {/* Total Deposits This Month Card */}
          <Link
            to="/deposit"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg transition-all hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium opacity-90">Deposits This Month</span>
              </div>
              <p className="text-3xl font-bold">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      statistics?.totalDepositsThisMonth || 0,
                      statistics?.currency?.code || 'USD'
                    )}
              </p>
              <p className="mt-2 text-sm opacity-75">Total deposits</p>
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
                        {formatDate(expense.date)}
                        <span>•</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                          {expense.categoryName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      -{formatCurrency(expense.amount, statistics?.currency?.code || 'USD')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
      />
    </Layout>
  )
}
