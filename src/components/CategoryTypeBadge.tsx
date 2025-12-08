import { CategoryType } from '@/types/category'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CategoryTypeBadgeProps {
  type: CategoryType
  size?: 'sm' | 'md'
}

export function CategoryTypeBadge({ type, size = 'md' }: CategoryTypeBadgeProps) {
  const isIncome = type === CategoryType.INCOME

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${
          isIncome
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        }
      `}
    >
      {isIncome ? (
        <TrendingUp className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      ) : (
        <TrendingDown className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      )}
      {type}
    </span>
  )
}
