/**
 * Transaction statistics calculator
 * Calculates statistics from filtered transaction arrays
 */

import type { Transaction, CategoryType } from '@/types'

export interface FilteredTransactionStats {
  totalAmount: number
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  averageAmount: number
  incomeCount: number
  expenseCount: number
}

/**
 * Calculate statistics from an array of transactions
 * @param transactions - Array of transactions to analyze
 * @returns Calculated statistics
 */
export function calculateTransactionStats(
  transactions: Transaction[]
): FilteredTransactionStats {
  if (transactions.length === 0) {
    return {
      totalAmount: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netAmount: 0,
      transactionCount: 0,
      averageAmount: 0,
      incomeCount: 0,
      expenseCount: 0
    }
  }

  let totalIncome = 0
  let totalExpenses = 0
  let incomeCount = 0
  let expenseCount = 0

  transactions.forEach(transaction => {
    if (transaction.categoryType === 'INCOME') {
      totalIncome += transaction.amount
      incomeCount++
    } else {
      totalExpenses += transaction.amount
      expenseCount++
    }
  })

  const totalAmount = totalIncome + totalExpenses
  const netAmount = totalIncome - totalExpenses
  const transactionCount = transactions.length
  const averageAmount = totalAmount / transactionCount

  return {
    totalAmount,
    totalIncome,
    totalExpenses,
    netAmount,
    transactionCount,
    averageAmount,
    incomeCount,
    expenseCount
  }
}
