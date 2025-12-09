import { useState, useEffect, FormEvent } from 'react'
import { X, FileText, Tag, Save, TrendingUp, TrendingDown, HelpCircle, ChevronDown, Tag as TagIcon} from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { Category } from '@/types/category.ts'
import { CategoryType, CategoryRequest } from '@/types/category'


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

  // Combined Handler for form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // 2. IMPROVEMENT: Only call fetchData if in edit mode or if the modal is opening
  useEffect(() => {
    if (isOpen) {
      if (!categoryId) {
        // New entry: Reset form state immediately
        resetFormState();
      } else {
        // Edit entry: Fetch data
        fetchData(categoryId);
      }
    }
  }, [isOpen, categoryId]) // Depend only on modal visibility and ID

  const fetchData = async (id: number) => {
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
      console.error(err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // VALIDATION: Check if type is selected
    if (!formState.type) {
      setError('Please select a category type (Income or Expense).');
      return;
    }

    const categoryData: CategoryRequest = {
      name: formState.name,
      description: formState.description || undefined,
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 3. IMPROVEMENT: handleClose no longer needs to manually reset state, resetFormState does that during the next open cycle.
  const handleClose = () => {
    onClose()
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
                <Tag className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditMode ? 'Edit Category' : 'New Category'}
                </h2>
                <p className="mt-1 text-sm text-white/90">
                  {isEditMode ? 'Update category details' : 'Create a new category'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/20 hover:text-white">
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

                {/* 1. Category Name */}
                <div>
                  <label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="h-4 w-4" />
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
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
                <div>
                  <label htmlFor="type" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <TagIcon className="h-4 w-4" />
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {/* Dynamic Icon */}
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                      {formState.type === CategoryType.EXPENSE ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : formState.type === CategoryType.INCOME ? (
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <select id="type" required value={formState.type}
                            onChange={handleChange} // Use combined handler
                            className={`w-full appearance-none rounded-xl border py-3 pl-12 pr-10 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                              formState.type === '' ? 'border-slate-200 text-slate-500' : 'border-slate-200 bg-white text-slate-900'
                            }`}>
                      <option value="" disabled>Select a type...</option>
                      <option value={CategoryType.EXPENSE}>Expense</option>
                      <option value={CategoryType.INCOME}>Income</option>
                    </select>

                    {/* Custom Dropdown Arrow */}
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
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
      </div>
    </div>
  )
}