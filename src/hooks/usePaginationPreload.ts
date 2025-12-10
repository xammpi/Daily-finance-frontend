import { useEffect, useRef } from 'react'

/**
 * Custom hook for pagination preloading
 * Preloads the next page in the background for instant navigation
 * Based on backend optimization guide - search is now fast enough (40-60ms) to preload
 *
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param preloadFn - Function to preload the next page
 */
export function usePaginationPreload(
  currentPage: number,
  totalPages: number,
  preloadFn: (page: number) => Promise<void>
): void {
  const preloadedPages = useRef(new Set<number>())

  useEffect(() => {
    const nextPage = currentPage + 1

    // Only preload if there is a next page and it hasn't been preloaded yet
    if (nextPage < totalPages && !preloadedPages.current.has(nextPage)) {
      // Small delay to avoid preloading during active user interaction
      const timeoutId = setTimeout(() => {
        preloadFn(nextPage)
          .then(() => {
            preloadedPages.current.add(nextPage)
          })
          .catch((error) => {
            console.error('Failed to preload page:', error)
          })
      }, 500) // Wait 500ms before preloading

      return () => clearTimeout(timeoutId)
    }
  }, [currentPage, totalPages, preloadFn])

  // Clear preloaded pages cache when current page changes significantly
  useEffect(() => {
    // Clear cache if user jumps more than 2 pages away
    const cachedPages = Array.from(preloadedPages.current)
    const farAwayPages = cachedPages.filter(page => Math.abs(page - currentPage) > 2)

    farAwayPages.forEach(page => {
      preloadedPages.current.delete(page)
    })
  }, [currentPage])
}
