/**
 * Date utility functions from FRONTEND_INTEGRATION_GUIDE.md
 */

/**
 * Format date for API requests (YYYY-MM-DD)
 * @param date - Date object to format
 * @returns Formatted date string
 * @example
 * formatDateForAPI(new Date()) // "2024-12-04"
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get start and end dates for current month
 * @returns Object with startDate and endDate
 * @example
 * getCurrentMonthRange() // { startDate: "2024-12-01", endDate: "2024-12-31" }
 */
export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    startDate: formatDateForAPI(startOfMonth),
    endDate: formatDateForAPI(endOfMonth),
  }
}

/**
 * Get start and end dates for current week (Monday to Sunday)
 * @returns Object with startDate and endDate
 * @example
 * getCurrentWeekRange() // { startDate: "2024-12-02", endDate: "2024-12-08" }
 */
export function getCurrentWeekRange(): { startDate: string; endDate: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek

  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    startDate: formatDateForAPI(monday),
    endDate: formatDateForAPI(sunday),
  }
}

/**
 * Get today's date formatted for API
 * @returns Today's date string
 * @example
 * getTodayDate() // "2024-12-04"
 */
export function getTodayDate(): string {
  return formatDateForAPI(new Date())
}

/**
 * Format date for display (e.g., "Dec 4, 2024")
 * @param dateString - Date string to format
 * @returns Formatted date string
 * @example
 * formatDateForDisplay("2024-12-04") // "Dec 4, 2024"
 */
export function formatDateForDisplay(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date for short display (e.g., "Dec 4")
 * @param dateString - Date string to format
 * @returns Formatted date string
 * @example
 * formatDateShort("2024-12-04") // "Dec 4"
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
