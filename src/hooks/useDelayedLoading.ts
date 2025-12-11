import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for delayed loading states
 * Only shows loading spinner if operation takes longer than threshold
 * Recommended by backend optimization guide for operations expected to complete in <100ms
 *
 * @param isLoading - Current loading state
 * @param delay - Delay in ms before showing loading (default: 100ms)
 * @returns Whether to show loading spinner
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 100): boolean {
  const [showLoading, setShowLoading] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isLoading) {
      // Set timeout to show loading after delay
      timeoutRef.current = setTimeout(() => {
        setShowLoading(true)
      }, delay)
    } else {
      // Immediately hide loading when operation completes
      setShowLoading(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoading, delay])

  return showLoading
}
