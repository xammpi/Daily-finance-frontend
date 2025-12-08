import { CategoryType } from '@/types/category'

interface CategoryFilterProps {
  selectedType: CategoryType | 'ALL'
  onTypeChange: (type: CategoryType | 'ALL') => void
}

export function CategoryFilter({ selectedType, onTypeChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onTypeChange('ALL')}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-all
          ${
            selectedType === 'ALL'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
          }
        `}
      >
        All
      </button>
      <button
        onClick={() => onTypeChange(CategoryType.INCOME)}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-all
          ${
            selectedType === CategoryType.INCOME
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
          }
        `}
      >
        Income
      </button>
      <button
        onClick={() => onTypeChange(CategoryType.EXPENSE)}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-all
          ${
            selectedType === CategoryType.EXPENSE
              ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
          }
        `}
      >
        Expense
      </button>
    </div>
  )
}
