import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdownItem } from '@/types'

interface IncomeExpenseBarChartProps {
  incomeData: CategoryBreakdownItem[]
  expenseData: CategoryBreakdownItem[]
  currencySymbol: string
}

export function IncomeExpenseBarChart({
  incomeData,
  expenseData,
  currencySymbol
}: IncomeExpenseBarChartProps) {
  // Combine and group by category
  const allCategories = new Set([
    ...incomeData.map(c => c.categoryName),
    ...expenseData.map(c => c.categoryName)
  ])

  const chartData = Array.from(allCategories).map(categoryName => {
    const income = incomeData.find(c => c.categoryName === categoryName)
    const expense = expenseData.find(c => c.categoryName === categoryName)

    return {
      category: categoryName,
      income: income?.amount || 0,
      expenses: expense?.amount || 0
    }
  })

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="category"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${currencySymbol}${value}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="font-semibold text-slate-900">{label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {currencySymbol}{(entry.value as number)?.toFixed(2)}
                      </p>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Bar dataKey="income" fill="#10b981" name="Income" />
          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
