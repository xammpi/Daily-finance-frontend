import apiClient from './client'
import type {
  TransactionStatistics,
  PaginatedResponse,
  SearchRequest
} from '@/types'
import { Transaction, TransactionRequest } from '@/types'

export const transactionApi = {
  /**
   * Get all expenses (uses search endpoint with empty criteria)
   * @returns All expenses sorted by date descending
   */
  async getAll(): Promise<Transaction[]> {
    const response = await apiClient.post('/transactions/search', {
      criteria: [],
      page: 0,
      size: 50, // Optimized: reduced from 1000 to 50 (backend optimization recommendation)
      sortBy: 'date',
      sortOrder: 'DESC',
    })
    // Backend returns { transactions: {...}, summary: {...} }
    // Extract just the content array
    return response.data.transactions.content
  },

  /**
   * Search expenses using criteria-based filtering (POST endpoint)
   * Supports complex queries with multiple operations
   *
   * @param request - Search request with criteria array
   * @returns Paginated response with matching expenses
   */
  async search(request: SearchRequest): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.post(
      '/transactions/search',
      request
    )
    // Backend returns { transactions: {...}, summary: {...} }
    // Extract just the transactions pagination data
    return response.data.transactions
  },

  async getById(id: number): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data
  },

  async create(data: TransactionRequest): Promise<Transaction> {
    const response = await apiClient.post('/transactions', data)
    return response.data
  },

  async update(id: number, data: TransactionRequest): Promise<Transaction> {
    const response = await apiClient.put(`/transactions/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/transactions/${id}`)
  },

  async getStatistics(): Promise<TransactionStatistics> {
    const response = await apiClient.get('/transactions/statistics')
    return response.data
  },
}
