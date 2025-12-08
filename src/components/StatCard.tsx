import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, calculatePercentageChange, formatPercentage } from '@/lib/currency'
import type { Currency } from '@/types'

interface StatCardProps {
  title: string
  amount: number
  previousAmount?: number
  currency: Currency
  icon: LucideIcon
  gradient: string
}

export function StatCard({
  title,
  amount,
  previousAmount,
  currency,
  icon: Icon,
  gradient,
}: StatCardProps) {
  const hasComparison = previousAmount !== undefined
  const percentageChange = hasComparison
    ? calculatePercentageChange(amount, previousAmount)
    : null
  const isIncrease = percentageChange !== null && percentageChange > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {formatCurrency(amount, currency)}
          </h3>
        </div>
        <div
          className={`rounded-xl p-3 bg-gradient-to-br ${gradient}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {hasComparison && percentageChange !== null && (
        <div className="flex items-center gap-2">
          {isIncrease ? (
            <TrendingUp className="w-4 h-4 text-red-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          )}
          <span
            className={`text-sm font-medium ${
              isIncrease ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatPercentage(percentageChange)}
          </span>
          <span className="text-sm text-slate-500">vs previous period</span>
        </div>
      )}
    </div>
  )
}
