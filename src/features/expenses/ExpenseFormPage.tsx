import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Receipt, DollarSign, Calendar, FileText, Tag, Save } from 'lucide-react'
import { expensesApi } from '@/api/expenses'
import { categoriesApi } from '@/api/categories'
import Layout from '@/components/Layout'
import type { Expense, Category } from '@/types'

export default function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [categories, setCategories] = useState<Category[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const categoriesData = await categoriesApi.getAll()
      setCategories(categoriesData)

      if (id) {
        const expense: Expense = await expensesApi.getById(Number(id))
        setAmount(expense.amount.toString())
        setDate(expense.date.split('T')[0])
        setDescription(expense.description)
        setCategoryId(expense.categoryId.toString())
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    const expenseData = {
      amount: parseFloat(amount),
      date,
      description,
      categoryId: Number(categoryId),
    }

    try {
      setIsLoading(true)
      if (isEditMode) {
        await expensesApi.update(Number(id), expenseData)
      } else {
        await expensesApi.create(expenseData)
      }
      navigate('/expenses')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-slate-600">Loading expense...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back Button */}
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
            <Receipt className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditMode ? 'Edit Expense' : 'New Expense'}
            </h1>
            <p className="mt-1 text-slate-600">
              {isEditMode ? 'Update your expense details' : 'Record a new expense transaction'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
          <div>
            <label htmlFor="amount" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <DollarSign className="h-4 w-4" />
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="date" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="h-4 w-4" />
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="h-4 w-4" />
              Description <span className="text-red-500">*</span>
            </label>
            <input
              id="description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g., Grocery shopping at Walmart"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Tag className="h-4 w-4" />
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No categories found.{' '}
                <Link to="/categories/new" className="font-medium text-indigo-600 hover:text-indigo-700">
                  Create one first
                </Link>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="h-5 w-5" />
              {isLoading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Create Expense'}
            </button>
            <Link
              to="/expenses"
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}
