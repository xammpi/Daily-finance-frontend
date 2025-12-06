/**
 * React hook for using BalanceManager
 * Provides reactive balance updates across components
 */

import { useState, useEffect } from 'react'
import { balanceManager } from '@/utils/BalanceManager'
import type { WalletResponse, Currency } from '@/types'

interface UseBalanceReturn {
  balance: number
  currency: Currency
  wallet: WalletResponse | null
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
  const [balance, setBalance] = useState<number>(balanceManager.getBalance())
  const [currency, setCurrency] = useState<Currency>(balanceManager.getCurrency())
  const [wallet, setWallet] = useState<WalletResponse | null>(balanceManager.getWallet())
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    // Initialize if not already done
    const initialize = async () => {
      if (!balanceManager.getWallet()) {
        setIsLoading(true)
        await balanceManager.initialize()
        setIsLoading(false)
      }
    }

    initialize()

    // Subscribe to balance updates
    const unsubscribe = balanceManager.subscribe((newBalance, newCurrency, newWallet) => {
      setBalance(newBalance)
      setCurrency(newCurrency)
      setWallet(newWallet)
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
