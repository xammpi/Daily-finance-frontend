import { useState, useEffect, FormEvent, useRef, useMemo, useCallback, memo } from 'react'
import { X, Receipt, DollarSign, Calendar, FileText, Tag, Save, Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { transactionApi } from '@/api/transaction.ts'
import { categoriesApi } from '@/api/categories'
import { userApi } from '@/api/user'
import { Transaction } from '@/types'
import { Category, CategoryType } from '@/types'
import { toast } from '@/lib/toast'
import { hasSufficientBalance } from '@/lib/currency'
import { extractErrorMessage } from '@/utils/errorHandler'
import { sanitizeString, validateAmount, validateDescription } from '@/utils/validation'
import { ModalErrorBoundary } from './ModalErrorBoundary'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { logger } from '@/utils/logger'
interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transactionId?: number
}

// Memoized CategoryItem component for better scroll performance
interface CategoryItemProps {
  category: Category
  isSelected: boolean
  isFocused: boolean
  onSelect: (_category: Category) => void
}

const CategoryItem = memo(({ category, isSelected, isFocused, onSelect }: CategoryItemProps) => {
  const isIncome = category.type === CategoryType.INCOME

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        isSelected
          ? 'bg-indigo-50 text-indigo-900'
          : isFocused
          ? 'bg-slate-100'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
        isIncome ? 'bg-emerald-500' : 'bg-red-500'
      }`}>
        {isIncome ? (
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
      {isSelected && (
        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600" />
      )}
    </button>
  )
})

CategoryItem.displayName = 'CategoryItem'

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
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(-1)
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const categorySearchInputRef = useRef<HTMLInputElement>(null)
  const dropdownTriggerRef = useRef<HTMLDivElement>(null)

  // Handle close modal
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

  // Use modal behavior hook for common functionality
  useModalBehavior({
    isOpen,
    onClose: handleClose,
    modalRef,
    firstInputRef,
  })

  // Memoize fetchData to avoid recreating on every render
  const fetchData = useCallback(async () => {
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
      logger.error('Failed to load transaction data', err)
    } finally {
      setIsFetching(false)
    }
  }, [transactionId])

  useEffect(() => {
    if (isOpen) {
      void fetchData()
      setCategorySearch('')
      setIsDropdownOpen(false)
    }
  }, [isOpen, fetchData])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setFocusedCategoryIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate amount
    const amountError = validateAmount(amount)
    if (amountError) {
      setError(amountError)
      return
    }

    // Sanitize and validate description
    const sanitizedDescription = sanitizeString(description)
    const descriptionError = validateDescription(sanitizedDescription)
    if (descriptionError) {
      setError(descriptionError)
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    const transactionExpenseData = {
      amount: parseFloat(amount),
      date,
      description: sanitizedDescription,
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
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      setError(errorMessage)

      // Check if it's an insufficient balance error from backend
      if (errorMessage.toLowerCase().includes('insufficient balance')) {
        toast.error(errorMessage)
      } else {
        toast.error('Failed to save transaction')
      }
      logger.error('Failed to load transaction data', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Memoize filtered categories to avoid recalculation on every render
  const filteredCategories = useMemo(() =>
    categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    ),
    [categories, categorySearch]
  )

  // Memoize selected category
  const selectedCategory = useMemo(() =>
    categories.find(c => c.id === Number(categoryId)),
    [categories, categoryId]
  )

  // Memoize category selection handler
  const handleCategorySelect = useCallback((category: Category) => {
    setCategoryId(category.id.toString())
    setCategorySearch('')
    setIsDropdownOpen(false)
    setFocusedCategoryIndex(-1)
  }, [])

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!isDropdownOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedCategoryIndex(prev => {
            const nextIndex = prev < filteredCategories.length - 1 ? prev + 1 : prev
            // Start from 0 if no item is focused yet
            return prev === -1 ? 0 : nextIndex
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedCategoryIndex(prev => {
            if (prev === -1) return filteredCategories.length - 1
            return prev > 0 ? prev - 1 : 0
          })
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedCategoryIndex >= 0 && focusedCategoryIndex < filteredCategories.length) {
            handleCategorySelect(filteredCategories[focusedCategoryIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsDropdownOpen(false)
          setFocusedCategoryIndex(-1)
          categorySearchInputRef.current?.focus()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen, focusedCategoryIndex, filteredCategories, handleCategorySelect])

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedCategoryIndex(-1)
  }, [categorySearch])

  // Auto-scroll to focused item
  useEffect(() => {
    if (isDropdownOpen && focusedCategoryIndex >= 0 && dropdownRef.current) {
      const dropdown = dropdownRef.current.querySelector('.max-h-60')
      const focusedItem = dropdown?.querySelectorAll('button')[focusedCategoryIndex]

      if (focusedItem && dropdown) {
        const dropdownRect = dropdown.getBoundingClientRect()
        const itemRect = focusedItem.getBoundingClientRect()

        // Scroll if item is not fully visible
        if (itemRect.bottom > dropdownRect.bottom) {
          focusedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        } else if (itemRect.top < dropdownRect.top) {
          focusedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      }
    }
  }, [focusedCategoryIndex, isDropdownOpen])

  // Calculate dropdown direction when it opens
  useEffect(() => {
    if (isDropdownOpen && dropdownTriggerRef.current) {
      const triggerRect = dropdownTriggerRef.current.getBoundingClientRect()
      const dropdownHeight = 240 // max-h-60 = 15rem = 240px
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const buffer = 50 // Extra buffer for better UX

      // Open upward if not enough space below (with buffer) or if more space above
      if (spaceBelow < dropdownHeight + buffer || spaceAbove > spaceBelow) {
        setDropdownDirection('up')
      } else {
        setDropdownDirection('down')
      }
    }
  }, [isDropdownOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        aria-describedby="transaction-modal-description"
      >
        <ModalErrorBoundary onError={handleClose}>
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
                <h2 id="transaction-modal-title" className="text-2xl font-bold text-white">
                  {isEditMode ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <p id="transaction-modal-description" className="mt-1 text-sm text-white/90">
                  {isEditMode ? 'Update transaction details' : 'Record a new transaction'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/20 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isFetching ? (
          <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" aria-hidden="true" />
              <p className="text-sm text-slate-600">Loading transaction data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto px-6 pt-6 pb-8 scrollbar-hide">
              {error && (
                <div
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4 text-red-700 shadow-sm"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-md" aria-hidden="true">
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
                    ref={firstInputRef}
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
                      ref={dropdownTriggerRef}
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
                            ref={categorySearchInputRef}
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
                      <div className={`absolute z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ${
                        dropdownDirection === 'up' ? 'bottom-full mb-2' : 'mt-2'
                      }`}>
                        <div
                          className="max-h-60 overflow-y-auto scrollbar-hide"
                          style={{
                            scrollBehavior: 'auto',
                            willChange: 'scroll-position',
                            contain: 'layout style paint'
                          }}
                        >
                          {filteredCategories.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Tag className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                              <p className="text-sm font-medium text-slate-600">No categories found</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {categorySearch ? 'Try a different search term' : 'Please create a category first'}
                              </p>
                            </div>
                          ) : (
                            filteredCategories.map((category, index) => (
                              <CategoryItem
                                key={category.id}
                                category={category}
                                isSelected={category.id === Number(categoryId)}
                                isFocused={index === focusedCategoryIndex}
                                onSelect={handleCategorySelect}
                              />
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
        </ModalErrorBoundary>
      </div>
    </div>
  )
}
