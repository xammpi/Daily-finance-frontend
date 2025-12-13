import apiClient from './client'
import type {
  StatisticsOverview,
  StatisticsSummary,
  RangeStatistics,
  CategoryStatistics,
  TrendsStatistics
} from '@/types/entities/statistics'
import type {
  StatisticsSummaryParams,
  StatisticsRangeParams,
  StatisticsCategoryParams,
  StatisticsTrendsParams
} from '@/types/api/statistics'

/**
 * Statistics API client
 * All endpoints require authentication
 */
export const statisticsApi = {
  /**
   * Get quick overview (today/week/month snapshot)
   * Fast endpoint for dashboard widgets
   * @returns Overview with today, week, and month statistics
   */
  async getOverview(): Promise<StatisticsOverview> {
    const response = await apiClient.get('/transactions/statistics/overview')
    return response.data
  },

  /**
   * Get comprehensive summary with averages and optional comparison
   * @param params - Period and comparison options
   * @returns Detailed summary with averages and comparisons
   */
  async getSummary(params?: StatisticsSummaryParams): Promise<StatisticsSummary> {
    const response = await apiClient.get('/transactions/statistics/summary', {
      params: {
        period: params?.period || 'MONTH',
        compareWithPrevious: params?.compareWithPrevious || false
      }
    })
    return response.data
  },

  /**
   * Get statistics for custom date range
   * @param params - Date range and filter options
   * @returns Statistics with top categories for specified range
   */
  async getRange(params: StatisticsRangeParams): Promise<RangeStatistics> {
    const response = await apiClient.get('/transactions/statistics/range', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        type: params.type,
        compareWithPrevious: params.compareWithPrevious || false
      }
    })
    return response.data
  },

  /**
   * Get category breakdown with percentages
   * @param params - Period, date range, and filter options
   * @returns Category breakdown sorted by amount
   */
  async getCategories(params?: StatisticsCategoryParams): Promise<CategoryStatistics> {
    const response = await apiClient.get('/transactions/statistics/categories', {
      params: {
        period: params?.period || 'MONTH',
        startDate: params?.startDate,
        endDate: params?.endDate,
        type: params?.type,
        minPercentage: params?.minPercentage
      }
    })
    return response.data
  },

  /**
   * Get time-series trends for charts
   * @param params - Date range, grouping, and filter options
   * @returns Time-bucketed data points
   */
  async getTrends(params: StatisticsTrendsParams): Promise<TrendsStatistics> {
    const response = await apiClient.get('/transactions/statistics/trends', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: params.groupBy || 'DAY',
        type: params.type
      }
    })
    return response.data
  }
}
