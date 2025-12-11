/**
 * Check if user has sufficient balance
 * @param currentBalance - Current wallet balance
 * @param amount - Amount to spend
 * @returns Boolean
 */
export function hasSufficientBalance(currentBalance: number, amount: number): boolean {
  return currentBalance >= amount
}
