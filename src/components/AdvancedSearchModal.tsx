import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Search } from 'lucide-react'
import type { SearchCriteria, SearchOperation } from '@/types'

interface AdvancedSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (criteria: SearchCriteria[]) => void
  fields: { value: string; label: string }[]
}

const operations: { value: SearchOperation; label: string }[] = [
  { value: 'EQUALS', label: 'Equals' },
  { value: 'NOT_EQUALS', label: 'Not Equals' },
  { value: 'GREATER_THAN', label: 'Greater Than' },
  { value: 'GREATER_THAN_OR_EQUAL', label: 'Greater or Equal' },
  { value: 'LESS_THAN', label: 'Less Than' },
  { value: 'LESS_THAN_OR_EQUAL', label: 'Less or Equal' },
  { value: 'LIKE', label: 'Contains' },
  { value: 'STARTS_WITH', label: 'Starts With' },
  { value: 'ENDS_WITH', label: 'Ends With' },
  { value: 'IN', label: 'In List' },
  { value: 'NOT_IN', label: 'Not In List' },
  { value: 'IS_NULL', label: 'Is Empty' },
  { value: 'IS_NOT_NULL', label: 'Is Not Empty' },
  { value: 'BETWEEN', label: 'Between' },
]

export function AdvancedSearchModal({
  isOpen,
  onClose,
  onSearch,
  fields,
}: AdvancedSearchModalProps) {
  const [criteria, setCriteria] = useState<SearchCriteria[]>([
    { field: 'amount', operation: 'GREATER_THAN', value: '' },
  ])

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

  if (!isOpen) return null

  const addCriteria = () => {
    setCriteria([
      ...criteria,
      { field: fields[0]?.value || '', operation: 'EQUALS', value: '' },
    ])
  }

  const removeCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  const updateCriteria = (index: number, updates: Partial<SearchCriteria>) => {
    const newCriteria = [...criteria]
    newCriteria[index] = { ...newCriteria[index], ...updates }
    setCriteria(newCriteria)
  }

  const handleSearch = () => {
    const validCriteria = criteria.filter(
      (c) =>
        c.operation === 'IS_NULL' ||
        c.operation === 'IS_NOT_NULL' ||
        (c.value !== '' && c.value !== undefined)
    )
    onSearch(validCriteria)
    onClose()
  }

  const needsValueTo = (operation: SearchOperation) => operation === 'BETWEEN'
  const needsValue = (operation: SearchOperation) =>
    operation !== 'IS_NULL' && operation !== 'IS_NOT_NULL'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 px-6 py-6">
          {/* Decorative Circles */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Search className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Advanced Search</h2>
                <p className="mt-1 text-sm text-white/90">Build custom search criteria</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition-all hover:bg-white/20 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {criteria.map((criterion, index) => (
            <div
              key={index}
              className="relative flex flex-col gap-3 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* Field */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Field
                  </label>
                  <select
                    value={criterion.field}
                    onChange={(e) => updateCriteria(index, { field: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {fields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operation */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Operation
                  </label>
                  <select
                    value={criterion.operation}
                    onChange={(e) =>
                      updateCriteria(index, { operation: e.target.value as SearchOperation })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {operations.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete button */}
                {criteria.length > 1 && (
                  <button
                    onClick={() => removeCriteria(index)}
                    className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50 text-red-600 transition-all hover:border-red-300 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Value */}
              {needsValue(criterion.operation) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {needsValueTo(criterion.operation) ? 'From' : 'Value'}
                    </label>
                    <input
                      type="text"
                      value={String(criterion.value)}
                      onChange={(e) => updateCriteria(index, { value: e.target.value })}
                      placeholder="Enter value"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {needsValueTo(criterion.operation) && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        To
                      </label>
                      <input
                        type="text"
                        value={criterion.valueTo || ''}
                        onChange={(e) => updateCriteria(index, { valueTo: e.target.value })}
                        placeholder="Enter value"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Criteria Button */}
          <button
            onClick={addCriteria}
            className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Criteria
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
