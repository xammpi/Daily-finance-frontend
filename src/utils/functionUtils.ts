/**
 * Function utility helpers from FRONTEND_INTEGRATION_GUIDE.md
 */

/**
 * Debounce function to limit function calls
 * Useful for search inputs, resize handlers, etc.
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * @example
 * const debouncedSearch = debounce(searchExpenses, 300)
 * debouncedSearch(query) // Will only execute after 300ms of no calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function execution rate
 * Ensures function is called at most once per specified time period
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 * @example
 * const throttledScroll = throttle(handleScroll, 100)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Sleep/delay function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 * @example
 * await sleep(1000) // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 * @param func - Async function to retry
 * @param retries - Number of retries
 * @param delay - Initial delay in milliseconds
 * @returns Result of function or throws error
 * @example
 * const data = await retry(() => fetchData(), 3, 1000)
 */
export async function retry<T>(
  func: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await func()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    await sleep(delay)
    return retry(func, retries - 1, delay * 2)
  }
}
