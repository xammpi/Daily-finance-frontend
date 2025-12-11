import { useState, useEffect, FormEvent, useRef, ChangeEvent, useCallback } from 'react'
import { X, FileText, Tag, Save, TrendingUp, TrendingDown, HelpCircle, ChevronDown, Tag as TagIcon} from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { Category } from '@/types'
import { CategoryType, CategoryRequest } from '@/types'
import { extractErrorMessage } from '@/utils/errorHandler'
import { sanitizeString, validateCategoryName } from '@/utils/validation'
import { ModalErrorBoundary } from './ModalErrorBoundary'
import { logger } from '@/utils/logger'
import { useModalBehavior } from '@/hooks/useModalBehavior'


interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categoryId?: number // Use number | undefined for consistency
}

export default function CategoryModal({ isOpen, onClose, onSuccess, categoryId }: CategoryModalProps) {
  const isEditMode = Boolean(categoryId)

  // State Management: Grouping form state for easier reset and readability
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    type: '' as CategoryType | '', // Cast initial empty string with the union type
  });

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [typeDropdownDirection, setTypeDropdownDirection] = useState<'down' | 'up'>('down')

  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const typeTriggerRef = useRef<HTMLDivElement>(null)

  // Combined Handler for form inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  // 1. IMPROVEMENT: Reset logic consolidated and separated from the main fetchData logic
  const resetFormState = () => {
    setFormState({
      name: '',
      description: '',
      type: '' as CategoryType | '', // Reset to force selection
    });
    setError(null);
  };

  // Handle close modal
  const handleClose = () => {
    setIsTypeDropdownOpen(false)
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
  const fetchData = useCallback(async (id: number) => {
    try {
      setIsFetching(true)
      const category: Category = await categoriesApi.getById(id)

      // Update form state using fetched data
      setFormState({
        name: category.name,
        description: category.description || '',
        type: category.type,
      });

    } catch (err) {
      setError('Failed to load data')
      logger.error('Failed to load category data', err)
    } finally {
      setIsFetching(false)
    }
  }, [])

  // 2. IMPROVEMENT: Only call fetchData if in edit mode or if the modal is opening
  useEffect(() => {
    if (isOpen) {
      if (!categoryId) {
        // New entry: Reset form state immediately
        resetFormState();
      } else {
        // Edit entry: Fetch data
        void fetchData(categoryId);
      }
    }
  }, [isOpen, categoryId, fetchData]) // Include fetchData in dependencies

  // Close type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate type dropdown direction when it opens
  useEffect(() => {
    if (isTypeDropdownOpen && typeTriggerRef.current) {
      const triggerRect = typeTriggerRef.current.getBoundingClientRect()
      const dropdownHeight = 200 // Height for 2 items + padding
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const buffer = 50 // Extra buffer for better UX

      // Open upward if not enough space below (with buffer) or if more space above
      if (spaceBelow < dropdownHeight + buffer || spaceAbove > spaceBelow) {
        setTypeDropdownDirection('up')
      } else {
        setTypeDropdownDirection('down')
      }
    }
  }, [isTypeDropdownOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Sanitize and validate name
    const sanitizedName = sanitizeString(formState.name)
    const nameError = validateCategoryName(sanitizedName)
    if (nameError) {
      setError(nameError)
      return
    }

    // Sanitize description if provided
    const sanitizedDescription = formState.description
      ? sanitizeString(formState.description)
      : undefined

    // VALIDATION: Check if type is selected
    if (!formState.type) {
      setError('Please select a category type (Income or Expense).');
      return;
    }

    const categoryData: CategoryRequest = {
      name: sanitizedName,
      description: sanitizedDescription,
      type: formState.type as CategoryType,
    }

    try {
      setIsLoading(true)
      if (isEditMode && categoryId) {
        await categoriesApi.update(categoryId, categoryData)
      } else {
        await categoriesApi.create(categoryData)
      }
      onSuccess()
      onClose(); // Use direct onClose() since state cleanup happens *before* the next open cycle
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      setError(errorMessage)
      logger.error('Failed to save category', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle type selection from custom dropdown
  const handleTypeSelect = (type: CategoryType) => {
    setFormState(prev => ({ ...prev, type }))
    setIsTypeDropdownOpen(false)
  }

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
        aria-labelledby="category-modal-title"
        aria-describedby="category-modal-description"
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
                <Tag className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 id="category-modal-title" className="text-2xl font-bold text-white">
                  {isEditMode ? 'Edit Category' : 'New Category'}
                </h2>
                <p id="category-modal-description" className="mt-1 text-sm text-white/90">
                  {isEditMode ? 'Update category details' : 'Create a new category'}
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
              <p className="text-sm text-slate-600">Loading category data...</p>
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

                {/* 1. Category Name */}
                <div>
                  <label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="h-4 w-4" />
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="name"
                    type="text"
                    required
                    value={formState.name} // Use formState
                    onChange={handleChange} // Use combined handler
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g., Groceries, Salary, Rent"
                  />
                </div>

                {/* 2. Category Description */}
                <div>
                  <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="h-4 w-4" />
                    Description (Optional)
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={formState.description} // Use formState
                    onChange={handleChange} // Use combined handler
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g., Groceries are non-negotiable"
                  />
                </div>

                {/* 3. Category Type Dropdown */}
                <div ref={typeDropdownRef}>
                  <label htmlFor="type" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <TagIcon className="h-4 w-4" />
                    Type <span className="text-red-500">*</span>
                  </label>

                  {/* Custom Type Dropdown */}
                  <div className="relative">
                    {/* Display Selected Type */}
                    <div
                      ref={typeTriggerRef}
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
                      role="button"
                      tabIndex={0}
                      aria-label="Select category type (Income or Expense)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setIsTypeDropdownOpen(!isTypeDropdownOpen)
                        }
                      }}
                    >
                      {formState.type ? (
                        <>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            formState.type === CategoryType.INCOME ? 'bg-emerald-500' : 'bg-red-500'
                          }`}>
                            {formState.type === CategoryType.INCOME ? (
                              <TrendingUp className="h-4 w-4 text-white" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="flex-1 text-slate-900 font-medium">
                            {formState.type === CategoryType.INCOME ? 'Income' : 'Expense'}
                          </span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="h-5 w-5 text-slate-400" />
                          <span className="flex-1 text-slate-500">Select a type...</span>
                        </>
                      )}
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown List */}
                    {isTypeDropdownOpen && (
                      <div className={`absolute z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ${
                        typeDropdownDirection === 'up' ? 'bottom-full mb-2' : 'mt-2'
                      }`}>
                        <button
                          type="button"
                          onClick={() => handleTypeSelect(CategoryType.EXPENSE)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                            formState.type === CategoryType.EXPENSE ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500">
                            <TrendingDown className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">Expense</p>
                            <p className="text-xs text-slate-500">Money going out</p>
                          </div>
                          {formState.type === CategoryType.EXPENSE && (
                            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTypeSelect(CategoryType.INCOME)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                            formState.type === CategoryType.INCOME ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500">
                            <TrendingUp className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">Income</p>
                            <p className="text-xs text-slate-500">Money coming in</p>
                          </div>
                          {formState.type === CategoryType.INCOME && (
                            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      name="type"
                      value={formState.type}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with buttons - Always visible */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !formState.type} // Disable if type is not selected
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