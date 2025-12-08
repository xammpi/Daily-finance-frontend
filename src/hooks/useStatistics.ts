import { useState, useEffect, useCallback } from 'react'
import { transactionApi } from '@/api/transaction'
import type { ExpenseStatistics } from '@/types'

export function useStatistics() {
  const [statistics, setStatistics] = useState<ExpenseStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await transactionApi.getStatistics()
      setStatistics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
  }
}
