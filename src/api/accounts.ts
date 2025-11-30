import apiClient from './client'
import type { Account } from '@/types'

export interface CreateAccountRequest {
  name: string
  type: string
  balance: number
  currency: string
}

export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const response = await apiClient.get<Account[]>('/accounts')
    return response.data
  },

  getById: async (id: number): Promise<Account> => {
    const response = await apiClient.get<Account>(`/accounts/${id}`)
    return response.data
  },

  create: async (data: CreateAccountRequest): Promise<Account> => {
    const response = await apiClient.post<Account>('/accounts', data)
    return response.data
  },

  update: async (id: number, data: Partial<CreateAccountRequest>): Promise<Account> => {
    const response = await apiClient.put<Account>(`/accounts/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`)
  },
}
