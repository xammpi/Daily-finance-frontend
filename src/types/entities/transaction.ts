/**
 * Transaction entity types
 */

import type { CategoryType, Currency } from '.'

/**
 * Transaction entity
 * Represents a financial transaction (expense or income)
 */
export interface Transaction {
  readonly id: number
  readonly amount: number
  readonly date: string
  readonly description: string
  readonly categoryId: number
  readonly categoryName: string
  readonly categoryType: CategoryType
  readonly createdAt: string
  readonly updatedAt: string
}

/**
 * Transaction statistics
 * Aggregated expense statistics for dashboard display
 */
export interface TransactionStatistics {
  readonly todayExpenses: number
  readonly weekExpenses: number
  readonly monthExpenses: number
  readonly totalExpenses: number
  readonly averageDailyExpenses: number
  readonly averageWeeklyExpenses: number
  readonly averageMonthlyExpenses: number
  readonly previousWeekExpenses: number
  readonly previousMonthExpenses: number
  readonly currency: Currency
}
