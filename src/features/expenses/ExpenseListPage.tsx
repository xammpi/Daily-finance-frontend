import { useState, useEffect } from 'react'
import {
  Receipt,
  Calendar,
  TrendingDown,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { expensesApi } from '@/api/expenses'
import Layout from '@/components/Layout'
import ExpenseModal from '@/components/ExpenseModal'
import type { Expense } from '@/types'

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | undefined>(undefined)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await expensesApi.getAll()
      setExpenses(data)
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
      alert('Failed to delete expense')
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

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

    return formatted
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group expenses by date
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
    return groups
  }, {} as Record<string, Expense[]>)

  if (isLoading) {
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
              {filteredExpenses.length} total expense{filteredExpenses.length !== 1 ? 's' : ''}
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

        {/* Search and Filter */}
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
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Filter className="h-5 w-5" />
            Filter
          </button>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mb-2 text-lg font-medium text-slate-900">No expenses found</p>
            <p className="mb-6 text-slate-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by creating your first expense'}
            </p>
            {!searchTerm && (
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
                          <p className="text-xl font-bold text-red-600">-{formatAmount(expense.amount)}</p>
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
