import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { CategoryBreakdownItem } from '@/types'

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[]
  currencySymbol: string
}

const COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // purple-500
  '#3b82f6', // blue-500
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
]

export function CategoryPieChart({ data, currencySymbol }: CategoryPieChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.amount,
    percentage: item.percentage,
    count: item.transactionCount,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percentage }) => `${percentage.toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="font-semibold text-slate-900">{data.name}</p>
                    <p className="text-sm text-slate-600">
                      Amount: {currencySymbol}{data.value.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {data.percentage.toFixed(1)}% of total
                    </p>
                    <p className="text-sm text-slate-600">
                      {data.count} transactions
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
