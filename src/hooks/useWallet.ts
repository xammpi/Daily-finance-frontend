import { useState, useEffect, useCallback } from 'react'
import { userApi } from '@/api/user'
import type { Wallet } from '@/types'

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await userApi.getWallet()
      setWallet(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  return {
    wallet,
    isLoading,
    error,
    refetch: fetchWallet,
  }
}
