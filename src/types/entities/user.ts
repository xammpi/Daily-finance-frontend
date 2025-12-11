/**
 * User entity types
 */

import type { Currency } from '.'

/**
 * User profile entity
 * Returned from /api/v1/user/profile
 */
export interface User {
  readonly id: number
  readonly username: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly currencyId: number
}

/**
 * Wallet entity
 * Returned from /api/v1/user/wallet
 * Contains balance information and transaction statistics
 */
export interface Wallet {
  readonly id: number
  readonly amount: number
  readonly currency: Currency
  readonly totalDeposits: number
  readonly totalDepositAmount: number
  readonly totalExpenses: number
  readonly totalExpenseAmount: number
  readonly lastTransactionDate?: string
  readonly lowBalanceWarning: boolean
}
