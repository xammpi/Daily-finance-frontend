import { useState } from 'react'
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Advanced Search</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {criteria.map((criterion, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
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
                    className="mt-6 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
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
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Criteria
          </button>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-105 transition-transform"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
