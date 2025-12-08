import type { Currency } from '@/types'

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currency - Currency object with symbol
 * @returns Formatted string (e.g., "$100.50")
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return `${currency.symbol}${amount.toFixed(2)}`
}

/**
 * Format amount with currency symbol (simple version)
 * @param amount - The amount to format
 * @param symbol - Currency symbol (e.g., "$", "€")
 * @returns Formatted string (e.g., "$100.50")
 */
export function formatAmount(amount: number, symbol: string = '$'): string {
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Parse currency amount from string
 * @param value - String value (e.g., "100.50" or "100")
 * @returns Parsed number with 2 decimal places
 */
export function parseCurrencyAmount(value: string): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100
}

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @returns Validation result
 */
export function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount)) {
    return { valid: false, error: 'Amount must be a valid number' }
  }
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' }
  }
  if (amount > 999999999.99) {
    return { valid: false, error: 'Amount is too large' }
  }
  // Check decimal places (max 2)
  if (Math.round(amount * 100) / 100 !== amount) {
    return { valid: false, error: 'Amount can have at most 2 decimal places' }
  }
  return { valid: true }
}

/**
 * Check if user has sufficient balance
 * @param currentBalance - Current wallet balance
 * @param amount - Amount to spend
 * @returns Boolean
 */
export function hasSufficientBalance(currentBalance: number, amount: number): boolean {
  return currentBalance >= amount
}

/**
 * Calculate percentage change
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (e.g., 15.5 for 15.5% increase)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Format percentage
 * @param percentage - Percentage value
 * @returns Formatted string (e.g., "+15.5%" or "-5.2%")
 */
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(1)}%`
}
