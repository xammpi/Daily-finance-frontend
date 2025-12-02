import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { expensesApi } from '@/api/expenses'
import { userApi } from '@/api/user'
import type { Expense, BalanceSummary } from '@/types'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [expensesData, summary] = await Promise.all([
        expensesApi.getAll(),
        userApi.getBalanceSummary(),
      ])
      // Get only the 5 most recent expenses
      setExpenses(expensesData.slice(0, 5))
      setBalanceSummary(summary)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.username || user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Current Balance</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isLoading
                ? '...'
                : formatCurrency(
                    balanceSummary?.currentBalance || 0,
                    balanceSummary?.currency || 'USD'
                  )}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {balanceSummary?.currency || 'USD'}
            </p>
          </div>

          <Link
            to="/expenses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Monthly Expenses</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {isLoading
                ? '...'
                : formatCurrency(
                    balanceSummary?.totalExpensesThisMonth || 0,
                    balanceSummary?.currency || 'USD'
                  )}
            </p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </Link>

          <Link
            to="/categories"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <div className="text-sm text-indigo-600 hover:text-indigo-700">
                → Manage Categories
              </div>
              <div className="text-sm text-indigo-600 hover:text-indigo-700">
                → View Reports
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
              <Link
                to="/expenses"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No expenses yet</p>
                <Link
                  to="/expenses/new"
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Expense
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
                        <span className="text-lg text-red-600">↓</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(expense.date)} • {expense.categoryName}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(expense.amount, balanceSummary?.currency || 'USD')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link
                to="/expenses/new"
                className="block p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <div className="font-medium">New Expense</div>
                <div className="text-xs text-indigo-600">Record an expense</div>
              </Link>
              <Link
                to="/deposit"
                className="block p-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
              >
                <div className="font-medium">Deposit Money</div>
                <div className="text-xs text-green-600">Add funds to balance</div>
              </Link>
              <Link
                to="/categories/new"
                className="block p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium">New Category</div>
                <div className="text-xs text-purple-600">Organize your spending</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
