import apiClient from './client'
import type {
  User,
  Wallet,
  CurrencyUpdateRequest,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '@/types'

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
    const response = await apiClient.get<any>('/user/wallet')
    // Transform backend response to match frontend Wallet type
    const data = response.data
    return {
      id: data.walletId || data.id,
      amount: data.currentBalance ?? data.amount ?? 0,
      currency: data.currency,
      totalDeposits: data.totalDeposits || 0,
      totalDepositAmount: data.totalDepositAmount || 0,
      totalExpenses: data.totalExpenses || 0,
      totalExpenseAmount: data.totalExpenseAmount || 0,
      lastTransactionDate: data.lastTransactionDate,
      lowBalanceWarning: data.lowBalanceWarning || false,
    }
  },

  /**
   * Update user's currency preference
   * @param data CurrencyUpdateRequest with currencyId
   */
  async updateCurrency(data: CurrencyUpdateRequest): Promise<void> {
    await apiClient.put('/user/currency', data)
  },

  /**
   * Update user profile information
   * @param data UpdateProfileRequest with firstName, lastName, email
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>('/user/profile', data)
    return response.data
  },

  /**
   * Change user password
   * @param data ChangePasswordRequest with currentPassword and newPassword
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/user/password', data)
  },
}
