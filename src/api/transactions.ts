import apiClient from './client'
import type { Transaction, PaginatedResponse } from '@/types'

export interface TransactionParams {
  page?: number
  size?: number
  sort?: string
}

export interface CreateTransactionRequest {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  description: string
  accountId: number
  categoryId: number
}

export const transactionsApi = {
  getAll: async (params?: TransactionParams): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', {
      params,
    })
    return response.data
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`)
    return response.data
  },

  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions', data)
    return response.data
  },

  update: async (id: number, data: Partial<CreateTransactionRequest>): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`)
  },
}
