import { useState, useEffect, FormEvent } from 'react'
import { X, Receipt, DollarSign, Calendar, FileText, Tag, Save } from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { categoriesApi } from '@/api/categories'
import { Transaction } from '@/types/transaction.ts'
import { Category } from '@/types/category.ts'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transactionId?: number
}

export default function TransactionModal({ isOpen, onClose, onSuccess, transactionId }: TransactionModalProps) {
  const isEditMode = Boolean(transactionId)

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [categories, setCategories] = useState<Category[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, transactionId])

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const categoriesData = await categoriesApi.getAll()
      setCategories(categoriesData)

      if (transactionId) {
        const expense: Transaction = await transactionApi.getById(transactionId)
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

    const transactionExpenseData = {
      amount: parseFloat(amount),
      date,
      description,
      categoryId: Number(categoryId),
    }

    try {
      setIsLoading(true)
      if (isEditMode && transactionId) {
        await transactionApi.update(transactionId, transactionExpenseData)
      } else {
        await transactionApi.create(transactionExpenseData)
      }
      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setCategoryId('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Expense' : 'New Transaction'}
              </h2>
              <p className="text-sm text-slate-600">
                {isEditMode ? 'Update expense details' : 'Record a new transaction'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                <p className="text-sm text-slate-600">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                    <span className="text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
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
                  <label
                    htmlFor="date"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
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
                  <label
                    htmlFor="description"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
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
                  <label
                    htmlFor="category"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
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
                      No categories found. Please create a category first.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Save className="h-5 w-5" />
                    {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
