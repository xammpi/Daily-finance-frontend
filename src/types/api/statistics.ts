/**
 * Statistics API request types
 * Parameter types for statistics endpoint requests
 */

import type { StatisticsPeriod, TrendGrouping } from '../entities/statistics'
import type { CategoryType } from '../entities/category'

/**
 * Parameters for summary endpoint
 */
export interface StatisticsSummaryParams {
  period?: StatisticsPeriod
  compareWithPrevious?: boolean
}

/**
 * Parameters for range endpoint
 */
export interface StatisticsRangeParams {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  type?: CategoryType
  compareWithPrevious?: boolean
}

/**
 * Parameters for category endpoint
 */
export interface StatisticsCategoryParams {
  period?: StatisticsPeriod
  startDate?: string // Required if period=CUSTOM
  endDate?: string   // Required if period=CUSTOM
  type?: CategoryType
  minPercentage?: number
}

/**
 * Parameters for trends endpoint
 */
export interface StatisticsTrendsParams {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  groupBy?: TrendGrouping
  type?: CategoryType
}
