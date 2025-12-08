import { useState } from 'react'
import { Calendar } from 'lucide-react'

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onApply?: () => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: DateRangeFilterProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handleApply = () => {
    onStartDateChange(localStartDate)
    onEndDateChange(localEndDate)
    onApply?.()
  }

  const handlePreset = (preset: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (preset) {
      case 'today':
        start = today
        end = today
        break
      case 'week':
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        end = today
        break
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = today
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1)
        end = today
        break
      case 'all':
        start = new Date(2000, 0, 1)
        end = today
        break
    }

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    setLocalStartDate(startStr)
    setLocalEndDate(endStr)
    onStartDateChange(startStr)
    onEndDateChange(endStr)
    onApply?.()
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800">Date Range</h3>
      </div>

      <div className="space-y-4">
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePreset('today')}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => handlePreset('week')}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePreset('month')}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => handlePreset('year')}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            This Year
          </button>
          <button
            onClick={() => handlePreset('all')}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            All Time
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:scale-105 transition-transform"
        >
          Apply Filter
        </button>
      </div>
    </div>
  )
}
