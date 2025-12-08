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
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Category' : 'New Category'}
              </h2>
              <p className="text-sm text-slate-600">
                {isEditMode ? 'Update category details' : 'Record a new category'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !formState.type} // Disable if type is not selected
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