/**
 * Balance Manager Class from FRONTEND_INTEGRATION_GUIDE.md
 * Manages balance state and real-time updates across the application
 */

import { userApi } from '@/api/user'
import type { WalletResponse, Currency } from '@/types'

type BalanceUpdateCallback = (balance: number, currency: Currency, wallet: WalletResponse) => void

/**
 * Singleton class for managing user balance state
 * Provides real-time balance updates and low balance warnings
 *
 * @example
 * const balanceManager = BalanceManager.getInstance()
 * await balanceManager.initialize()
 *
 * // Subscribe to balance updates
 * balanceManager.subscribe((balance, currency) => {
 *   console.log(`Balance: ${currency.symbol}${balance}`)
 * })
 *
 * // Refresh after transaction
 * await balanceManager.refresh()
 */
export class BalanceManager {
  private static instance: BalanceManager | null = null

  private balance: number = 0
  private currency: Currency = {
    id: 1,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    createdAt: '',
    updatedAt: '',
  }
  private wallet: WalletResponse | null = null
  private subscribers: Set<BalanceUpdateCallback> = new Set()
  private isInitialized: boolean = false
  private isInitializing: boolean = false
  private initializationPromise: Promise<WalletResponse | null> | null = null

  // Private constructor for singleton
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): BalanceManager {
    if (!BalanceManager.instance) {
      BalanceManager.instance = new BalanceManager()
    }
    return BalanceManager.instance
  }

  /**
   * Initialize balance manager by fetching current wallet data
   * Should be called once when app loads (after authentication)
   */
  public async initialize(): Promise<WalletResponse | null> {
    // If already initialized, return cached data
    if (this.isInitialized && this.wallet) {
      return this.wallet
    }

    // If initialization is in progress, return the existing promise
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise
    }

    // Start initialization
    this.isInitializing = true
    this.initializationPromise = (async () => {
      try {
        const walletData = await userApi.getWallet()
        this.wallet = walletData
        this.balance = walletData.currentBalance
        this.currency = walletData.currency
        this.isInitialized = true

        // Notify all subscribers
        this.notifySubscribers()

        return walletData
      } catch (error) {
        console.error('Failed to initialize BalanceManager:', error)
        return null
      } finally {
        this.isInitializing = false
        this.initializationPromise = null
      }
    })()

    return this.initializationPromise
  }

  /**
   * Refresh balance from API
   * Call this after transactions (deposit, withdraw, expense)
   * Forces a fresh API call regardless of initialization state
   */
  public async refresh(): Promise<void> {
    try {
      const walletData = await userApi.getWallet()
      this.wallet = walletData
      this.balance = walletData.currentBalance
      this.currency = walletData.currency
      this.isInitialized = true

      // Notify all subscribers
      this.notifySubscribers()
    } catch (error) {
      console.error('Failed to refresh BalanceManager:', error)
    }
  }

  /**
   * Subscribe to balance updates
   * @param callback - Function called when balance changes
   * @returns Unsubscribe function
   */
  public subscribe(callback: BalanceUpdateCallback): () => void {
    this.subscribers.add(callback)

    // Immediately call with current values if initialized
    if (this.isInitialized && this.wallet) {
      callback(this.balance, this.currency, this.wallet)
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers of balance change
   */
  private notifySubscribers(): void {
    if (!this.wallet) return

    this.subscribers.forEach((callback) => {
      callback(this.balance, this.currency, this.wallet!)
    })
  }

  /**
   * Get current balance
   */
  public getBalance(): number {
    return this.balance
  }

  /**
   * Get current currency
   */
  public getCurrency(): Currency {
    return this.currency
  }

  /**
   * Get full wallet data
   */
  public getWallet(): WalletResponse | null {
    return this.wallet
  }

  /**
   * Check if balance is low (< 100)
   */
  public isLowBalance(): boolean {
    return this.wallet?.lowBalanceWarning ?? false
  }

  /**
   * Check if balance is sufficient for amount
   */
  public hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount
  }

  /**
   * Get formatted balance string
   */
  public getFormattedBalance(): string {
    return `${this.currency.symbol}${this.balance.toFixed(2)}`
  }

  /**
   * Update balance optimistically (before API confirmation)
   * Use with caution - should be followed by refresh()
   */
  public updateBalanceOptimistic(delta: number): void {
    this.balance += delta
    if (this.wallet) {
      this.wallet.currentBalance = this.balance
      this.notifySubscribers()
    }
  }

  /**
   * Reset manager (for logout)
   */
  public reset(): void {
    this.balance = 0
    this.currency = {
      id: 1,
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      createdAt: '',
      updatedAt: '',
    }
    this.wallet = null
    this.subscribers.clear()
    this.isInitialized = false
    this.isInitializing = false
    this.initializationPromise = null
  }
}

// Export singleton instance
export const balanceManager = BalanceManager.getInstance()
