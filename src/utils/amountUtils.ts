/**
 * Amount utility functions from FRONTEND_INTEGRATION_GUIDE.md
 */

/**
 * Format amount for display with currency symbol
 * @param amount - Amount to format
 * @param currencySymbol - Currency symbol (e.g., "$", "€")
 * @returns Formatted amount string
 * @example
 * formatAmount(1234.56, "$") // "$1234.56"
 */
export function formatAmount(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${amount.toFixed(2)}`
}

/**
 * Format amount using Intl.NumberFormat for proper currency formatting
 * @param amount - Amount to format
 * @param currencyCode - Currency code (e.g., "USD", "EUR")
 * @returns Formatted amount string
 * @example
 * formatCurrency(1234.56, "USD") // "$1,234.56"
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

/**
 * Parse amount from string input
 * @param value - String value to parse
 * @returns Parsed number or 0 if invalid
 * @example
 * parseAmount("123.45") // 123.45
 * parseAmount("invalid") // 0
 */
export function parseAmount(value: string): number {
  return parseFloat(value) || 0
}

/**
 * Validate if amount is valid (positive number)
 * @param value - Value to validate
 * @returns True if valid, false otherwise
 * @example
 * isValidAmount("123.45") // true
 * isValidAmount("-10") // false
 * isValidAmount("abc") // false
 */
export function isValidAmount(value: string | number): boolean {
  const amount = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(amount) && amount > 0
}

/**
 * Validate if amount is sufficient
 * @param amount - Amount to check
 * @param balance - Current balance
 * @returns True if sufficient, false otherwise
 * @example
 * isSufficientBalance(50, 100) // true
 * isSufficientBalance(150, 100) // false
 */
export function isSufficientBalance(amount: number, balance: number): boolean {
  return amount <= balance
}

/**
 * Round amount to 2 decimal places
 * @param amount - Amount to round
 * @returns Rounded amount
 * @example
 * roundAmount(123.456) // 123.46
 */
export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100
}
