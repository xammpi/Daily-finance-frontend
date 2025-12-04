import apiClient from './client'
import type {
  StatisticsResponse,
  CategoryExpenseStatistics,
  PeriodStatistics,
} from '@/types'

export const statisticsApi = {
  /**
   * Get overall statistics (lifetime + current month)
   */
  async getOverall(): Promise<StatisticsResponse> {
    const response = await apiClient.get<StatisticsResponse>('/statistics/overall')
    return response.data
  },

  /**
   * Get expense breakdown by category (all-time, sorted by amount DESC)
   */
  async getByCategory(): Promise<CategoryExpenseStatistics[]> {
    const response = await apiClient.get<CategoryExpenseStatistics[]>('/statistics/by-category')
    return response.data
  },

  /**
   * Get today's statistics
   */
  async getDaily(): Promise<PeriodStatistics> {
    const response = await apiClient.get<PeriodStatistics>('/statistics/daily')
    return response.data
  },

  /**
   * Get current month's statistics (1st to last day of month)
   */
  async getMonthly(): Promise<PeriodStatistics> {
    const response = await apiClient.get<PeriodStatistics>('/statistics/monthly')
    return response.data
  },

  /**
   * Get current year's statistics (January 1 to December 31)
   */
  async getYearly(): Promise<PeriodStatistics> {
    const response = await apiClient.get<PeriodStatistics>('/statistics/yearly')
    return response.data
  },
}
