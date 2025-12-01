import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { transactionsApi } from '@/api/transactions'
import type { Transaction, PaginatedResponse } from '@/types'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const transactionsResponse = await transactionsApi.getAll({ page: 0, size: 5, sort: 'date,desc' })
      setTransactions((transactionsResponse as PaginatedResponse<Transaction>).content)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getMonthlyIncome = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return transactions
      .filter(t => t.type === 'INCOME' && new Date(t.date) >= startOfMonth)
      .reduce((total, t) => total + t.amount, 0)
  }

  const getMonthlyExpenses = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return transactions
      .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
      .reduce((total, t) => total + t.amount, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
          <Link
            to="/transactions"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Monthly Income</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {isLoading ? '...' : formatCurrency(getMonthlyIncome())}
            </p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </Link>

          <Link
            to="/transactions"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Monthly Expenses</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {isLoading ? '...' : formatCurrency(getMonthlyExpenses())}
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
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <Link
                to="/transactions"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No transactions yet</p>
                <Link
                  to="/transactions/new"
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Transaction
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        <span
                          className={`text-lg ${
                            transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '↑' : '↓'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
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
                to="/transactions/new"
                className="block p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <div className="font-medium">New Transaction</div>
                <div className="text-xs text-indigo-600">Record income or expense</div>
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
