import apiClient from './client'
import type {
  ExpenseStatistics,
  PaginatedResponse,
  SearchRequest
} from '@/types'
import { Transaction, TransactionRequest } from '@/types/transaction.ts'

export const transactionApi = {
  /**
   * Get all expenses (uses search endpoint with empty criteria)
   * @returns All expenses sorted by date descending
   */
  async getAll(): Promise<Transaction[]> {
    const response = await apiClient.post<PaginatedResponse<Transaction>>('/transactions/search', {
      criteria: [],
      page: 0,
      size: 1000,
      sortBy: 'date',
      sortOrder: 'DESC',
    })
    return response.data.content
  },

  /**
   * Search expenses using criteria-based filtering (POST endpoint)
   * Supports complex queries with multiple operations
   *
   * @param request - Search request with criteria array
   * @returns Paginated response with matching expenses
   */
  async search(request: SearchRequest): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.post<PaginatedResponse<Transaction>>(
      '/transactions/search',
      request
    )
    return response.data
  },

  async getById(id: number): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`)
    return response.data
  },

  async create(data: TransactionRequest): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions', data)
    return response.data
  },

  async update(id: number, data: TransactionRequest): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/transactions/${id}`)
  },

  async getStatistics(): Promise<ExpenseStatistics> {
    const response = await apiClient.get<ExpenseStatistics>('/transactions/statistics')
    return response.data
  },
}
