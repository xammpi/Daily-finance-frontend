import { useState, useEffect, useCallback } from 'react'
import { statisticsApi } from '@/api/statistics'
import type {
  CategoryStatistics,
  TrendsStatistics,
  StatisticsSummary
} from '@/types'
import type { CategoryType } from '@/types'
import { logger } from '@/utils/logger'

interface CategoryStatisticsHook {
  categoryStats: CategoryStatistics | null
  trends: TrendsStatistics | null
  summary: StatisticsSummary | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching category-related statistics
 * @param categoryType - Filter by INCOME or EXPENSE
 * @param period - Time period for statistics
 */
export function useCategoryStatistics(
  categoryType?: CategoryType,
  period: 'MONTH' | 'YEAR' = 'MONTH'
): CategoryStatisticsHook {
  const [categoryStats, setCategoryStats] = useState<CategoryStatistics | null>(null)
  const [trends, setTrends] = useState<TrendsStatistics | null>(null)
  const [summary, setSummary] = useState<StatisticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Calculate date range for trends based on period
      const endDate = new Date()
      const startDate = new Date()

      if (period === 'MONTH') {
        startDate.setMonth(startDate.getMonth() - 5) // Last 6 months
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1) // Last year
      }

      // Fetch all statistics in parallel
      const [categoryData, trendsData, summaryData] = await Promise.all([
        statisticsApi.getCategories({
          period,
          type: categoryType,
          minPercentage: 1 // Hide categories < 1%
        }),
        statisticsApi.getTrends({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupBy: period === 'MONTH' ? 'WEEK' : 'MONTH',
          type: categoryType
        }),
        statisticsApi.getSummary({
          period,
          compareWithPrevious: true
        })
      ])

      setCategoryStats(categoryData)
      setTrends(trendsData)
      setSummary(summaryData)
    } catch (err) {
      logger.error('Failed to fetch category statistics', err)
      setError('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }, [categoryType, period])

  useEffect(() => {
    void fetchStatistics()
  }, [fetchStatistics])

  return {
    categoryStats,
    trends,
    summary,
    isLoading,
    error,
    refresh: fetchStatistics
  }
}
