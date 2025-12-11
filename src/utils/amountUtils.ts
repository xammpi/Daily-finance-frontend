/**
 * Amount utility functions from FRONTEND_INTEGRATION_GUIDE.md
 */

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
