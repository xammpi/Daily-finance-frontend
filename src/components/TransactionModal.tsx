import { useState, useEffect, FormEvent, useRef } from 'react'
import { X, Receipt, DollarSign, Calendar, FileText, Tag, Save, Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { categoriesApi } from '@/api/categories'
import { userApi } from '@/api/user'
import { Transaction } from '@/types/transaction.ts'
import { Category, CategoryType } from '@/types/category.ts'
import { toast } from '@/lib/toast'
import { hasSufficientBalance } from '@/lib/currency'

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
  const [currentBalance, setCurrentBalance] = useState<number>(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Searchable dropdown state
  const [categorySearch, setCategorySearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchData()
      setCategorySearch('')
      setIsDropdownOpen(false)
    }
  }, [isOpen, transactionId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchData = async () => {
    try {
      setIsFetching(true)
      const [categoriesData, wallet] = await Promise.all([
        categoriesApi.getAll(),
        userApi.getWallet()
      ])
      setCategories(categoriesData)
      setCurrentBalance(wallet.amount)

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

    // Check category type and validate balance for expenses
    const selectedCategory = categories.find(c => c.id === Number(categoryId))
    if (selectedCategory?.type === CategoryType.EXPENSE && !isEditMode) {
      if (!hasSufficientBalance(currentBalance, transactionExpenseData.amount)) {
        const balance = currentBalance ?? 0
        setError(`Insufficient balance. You have $${balance.toFixed(2)}, but need $${transactionExpenseData.amount.toFixed(2)}`)
        toast.error('Insufficient balance for this expense')
        return
      }
    }

    try {
      setIsLoading(true)
      if (isEditMode && transactionId) {
        await transactionApi.update(transactionId, transactionExpenseData)
        toast.success('Transaction updated successfully')
      } else {
        await transactionApi.create(transactionExpenseData)
        toast.success('Transaction created successfully')
      }
      onSuccess()
      handleClose()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save transaction'
      setError(errorMessage)

      // Check if it's an insufficient balance error from backend
      if (errorMessage.toLowerCase().includes('insufficient balance')) {
        toast.error(errorMessage)
      } else {
        toast.error('Failed to save transaction')
      }
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
    setCategorySearch('')
    setIsDropdownOpen(false)
    setError(null)
    onClose()
  }

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  // Get selected category
  const selectedCategory = categories.find(c => c.id === Number(categoryId))

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setCategoryId(category.id.toString())
    setCategorySearch('')
    setIsDropdownOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-6">
          {/* Decorative Circles */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Receipt className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditMode ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <p className="mt-1 text-sm text-white/90">
                  {isEditMode ? 'Update transaction details' : 'Record a new transaction'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/20 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="text-sm text-slate-600">Loading...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto px-6 pt-6 scrollbar-hide">
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4 text-red-700 shadow-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-md">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-5">
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
                    type="text"
                    inputMode="decimal"
                    required
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow only numbers and a single dot with max 2 decimal places
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setAmount(value)
                      }
                    }}
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

                <div className="relative" ref={dropdownRef}>
                  <label
                    htmlFor="category-search"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Tag className="h-4 w-4" />
                    Category <span className="text-red-500">*</span>
                  </label>

                  {/* Custom Searchable Dropdown */}
                  <div className="relative">
                    {/* Display Selected or Search Input */}
                    <div
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
                    >
                      {selectedCategory && !isDropdownOpen ? (
                        <>
                          {/* Selected Category Display */}
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${
                            selectedCategory.type === CategoryType.INCOME
                              ? 'from-emerald-500 to-teal-600'
                              : 'from-red-500 to-orange-600'
                          }`}>
                            {selectedCategory.type === CategoryType.INCOME ? (
                              <TrendingUp className="h-4 w-4 text-white" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="flex-1 text-slate-900 font-medium">{selectedCategory.name}</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 text-slate-400" />
                          <input
                            id="category-search"
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsDropdownOpen(true)
                            }}
                            placeholder="Search categories..."
                            className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                          />
                        </>
                      )}
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown List */}
                    {isDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="max-h-60 overflow-y-auto scrollbar-hide" style={{ scrollBehavior: 'auto' }}>
                          {filteredCategories.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Tag className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                              <p className="text-sm font-medium text-slate-600">No categories found</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {categorySearch ? 'Try a different search term' : 'Please create a category first'}
                              </p>
                            </div>
                          ) : (
                            filteredCategories.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategorySelect(category)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                                  category.id === Number(categoryId)
                                    ? 'bg-indigo-50 text-indigo-900'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                                  category.type === CategoryType.INCOME
                                    ? 'bg-emerald-500'
                                    : 'bg-red-500'
                                }`}>
                                  {category.type === CategoryType.INCOME ? (
                                    <TrendingUp className="h-4 w-4 text-white" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{category.name}</p>
                                  {category.description && (
                                    <p className="text-xs text-slate-500 truncate">{category.description}</p>
                                  )}
                                </div>
                                {category.id === Number(categoryId) && (
                                  <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    name="category"
                    value={categoryId}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer with buttons - Always visible */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Save className="h-5 w-5" />
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
