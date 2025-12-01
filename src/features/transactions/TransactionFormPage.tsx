import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { transactionsApi } from '@/api/transactions'
import { categoriesApi } from '@/api/categories'
import type { Transaction, Category } from '@/types'

export default function TransactionFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
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
        const transaction: Transaction = await transactionsApi.getById(Number(id))
        setAmount(transaction.amount.toString())
        setType(transaction.type)
        setDate(transaction.date.split('T')[0])
        setDescription(transaction.description)
        setNotes(transaction.notes || '')
        setCategoryId(transaction.categoryId.toString())
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

    const transactionData = {
      amount: parseFloat(amount),
      type,
      date,
      description,
      notes: notes || undefined,
      categoryId: Number(categoryId),
    }

    try {
      setIsLoading(true)
      if (isEditMode) {
        await transactionsApi.update(Number(id), transactionData)
      } else {
        await transactionsApi.create(transactionData)
      }
      navigate('/transactions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Transaction' : 'New Transaction'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update transaction details' : 'Add a new income or expense'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="EXPENSE"
                  checked={type === 'EXPENSE'}
                  onChange={e => setType(e.target.value as 'EXPENSE')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Expense</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="INCOME"
                  checked={type === 'INCOME'}
                  onChange={e => setType(e.target.value as 'INCOME')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Income</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              id="description"
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter transaction description"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No categories found.{' '}
                <Link to="/categories/new" className="text-indigo-600 hover:text-indigo-700">
                  Create one first
                </Link>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading
                ? 'Saving...'
                : isEditMode
                  ? 'Update Transaction'
                  : 'Create Transaction'}
            </button>
            <Link
              to="/transactions"
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 text-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
