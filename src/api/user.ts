import apiClient from './client'
import type { User, BalanceSummary, DepositRequest } from '@/types'

export const userApi = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/user/profile')
    return response.data
  },

  async deposit(data: DepositRequest): Promise<User> {
    const response = await apiClient.post<User>('/user/deposit', data)
    return response.data
  },

  async getBalanceSummary(): Promise<BalanceSummary> {
    const response = await apiClient.get<BalanceSummary>('/user/balance-summary')
    return response.data
  },

  async updateCurrency(currency: string): Promise<User> {
    const response = await apiClient.put<User>(`/user/currency?currency=${currency}`)
    return response.data
  },
}
