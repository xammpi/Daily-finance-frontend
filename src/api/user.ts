import apiClient from './client'
import type { User, Wallet, DepositRequest, WithdrawRequest, BalanceUpdateRequest, CurrencyUpdateRequest } from '@/types'

export const userApi = {
  /**
   * Get user profile
   * @returns User profile with currencyId
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/user/profile')
    return response.data
  },

  /**
   * Get wallet details including balance and statistics
   * @returns Wallet with currency object and transaction stats
   */
  async getWallet(): Promise<Wallet> {
    const response = await apiClient.get<Wallet>('/user/wallet')
    return response.data
  },

  /**
   * Deposit money into wallet
   * @param data DepositRequest with amount
   */
  async deposit(data: DepositRequest): Promise<void> {
    await apiClient.post('/user/deposit', data)
  },

  /**
   * Withdraw money from wallet
   * @param data WithdrawRequest with amount
   */
  async withdraw(data: WithdrawRequest): Promise<void> {
    await apiClient.post('/user/withdraw', data)
  },

  /**
   * Update wallet balance (set to specific amount)
   * @param data BalanceUpdateRequest with amount
   */
  async updateBalance(data: BalanceUpdateRequest): Promise<void> {
    await apiClient.put('/user/balance', data)
  },

  /**
   * Update user's currency preference
   * @param data CurrencyUpdateRequest with currencyId
   */
  async updateCurrency(data: CurrencyUpdateRequest): Promise<void> {
    await apiClient.put('/user/currency', data)
  },
}
