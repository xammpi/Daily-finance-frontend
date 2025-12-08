/**
 * React hook for using BalanceManager
 * Provides reactive balance updates across components
 */

import { useState, useEffect } from 'react'
import { balanceManager } from '@/utils/BalanceManager'
import type { Wallet, Currency } from '@/types'

interface UseBalanceReturn {
  balance: number
  currency: Currency
  wallet: Wallet | null
  isLowBalance: boolean
  isLoading: boolean
  refresh: () => Promise<void>
  getFormattedBalance: () => string
  hasSufficientBalance: (amount: number) => boolean
}

/**
 * Hook for accessing and managing balance state
 *
 * @example
 * function MyComponent() {
 *   const { balance, currency, refresh, isLowBalance } = useBalance()
 *
 *   return (
 *     <div>
 *       <p>Balance: {currency.symbol}{balance}</p>
 *       {isLowBalance && <p>Low balance warning!</p>}
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   )
 * }
 */
export function useBalance(): UseBalanceReturn {
  const [balance, setBalance] = useState<number>(0)
  const [currency, setCurrency] = useState<Currency>({
    id: 1,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
  })
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Initialize and subscribe
    const initialize = async () => {
      setIsLoading(true)
      try {
        const walletData = await balanceManager.initialize()
        if (walletData) {
          console.log('Balance initialized:', walletData)
          setBalance(walletData.amount)
          setCurrency(walletData.currency)
          setWallet(walletData)
        }
      } catch (error) {
        console.error('Failed to initialize balance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()

    // Subscribe to balance updates
    const unsubscribe = balanceManager.subscribe((newBalance, newCurrency, newWallet) => {
      console.log('Balance updated via subscription:', newBalance, newWallet)
      setBalance(newBalance)
      setCurrency(newCurrency)
      setWallet(newWallet)
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  const refresh = async () => {
    setIsLoading(true)
    try {
      await balanceManager.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return {
    balance,
    currency,
    wallet,
    isLowBalance: balanceManager.isLowBalance(),
    isLoading,
    refresh,
    getFormattedBalance: () => balanceManager.getFormattedBalance(),
    hasSufficientBalance: (amount: number) => balanceManager.hasSufficientBalance(amount),
  }
}
