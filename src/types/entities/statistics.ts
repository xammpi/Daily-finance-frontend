/**
 * Statistics entity types
 * Core statistics data structures from backend API
 */

import type { Currency } from '.'

/**
 * Quick overview statistics (today/week/month snapshot)
 * @endpoint GET /transactions/statistics/overview
 */
export interface StatisticsOverview {
  readonly todayExpenses: number
  readonly todayIncome: number
  readonly weekExpenses: number
  readonly weekIncome: number
  readonly monthExpenses: number
  readonly monthIncome: number
  readonly currency: Currency
}

/**
 * Period for predefined time ranges
 */
export type StatisticsPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL_TIME' | 'CUSTOM'

/**
 * Trend grouping for time-series data
 */
export type TrendGrouping = 'DAY' | 'WEEK' | 'MONTH'

/**
 * Period comparison data
 */
export interface PeriodComparison {
  readonly previousExpenses: number
  readonly previousIncome: number
  readonly expensesChange: number
  readonly expensesChangePercent: number
  readonly incomeChange: number
  readonly incomeChangePercent: number
}

/**
 * Comprehensive summary with averages and comparisons
 * @endpoint GET /transactions/statistics/summary
 */
export interface StatisticsSummary {
  readonly period: StatisticsPeriod
  readonly startDate: string
  readonly endDate: string
  readonly totalExpenses: number
  readonly totalIncome: number
  readonly netAmount: number
  readonly transactionCount: number
  readonly averageExpensePerDay: number
  readonly averageIncomePerDay: number
  readonly averageTransactionAmount: number
  readonly comparison: PeriodComparison | null
  readonly currency: Currency
}

/**
 * Category breakdown item
 */
export interface CategoryBreakdownItem {
  readonly categoryId: number
  readonly categoryName: string
  readonly categoryType: 'INCOME' | 'EXPENSE'
  readonly amount: number
  readonly transactionCount: number
  readonly percentage: number
  readonly averageTransactionAmount: number
}

/**
 * Category statistics response
 * @endpoint GET /transactions/statistics/categories
 */
export interface CategoryStatistics {
  readonly period: StatisticsPeriod
  readonly startDate: string
  readonly endDate: string
  readonly totalAmount: number
  readonly totalTransactionCount: number
  readonly categories: CategoryBreakdownItem[]
  readonly currency: Currency
}

/**
 * Custom date range statistics
 * @endpoint GET /transactions/statistics/range
 */
export interface RangeStatistics {
  readonly startDate: string
  readonly endDate: string
  readonly daysCount: number
  readonly totalExpenses: number
  readonly totalIncome: number
  readonly netAmount: number
  readonly transactionCount: number
  readonly averagePerDay: number
  readonly topCategories: CategoryBreakdownItem[]
  readonly comparison: PeriodComparison | null
  readonly currency: Currency
}

/**
 * Trend data point for time-series
 */
export interface TrendDataPoint {
  readonly date: string
  readonly expenses: number
  readonly income: number
  readonly netAmount: number
  readonly transactionCount: number
}

/**
 * Trends response for charts
 * @endpoint GET /transactions/statistics/trends
 */
export interface TrendsStatistics {
  readonly startDate: string
  readonly endDate: string
  readonly groupBy: TrendGrouping
  readonly dataPoints: TrendDataPoint[]
  readonly currency: Currency
}
