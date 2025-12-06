import apiClient from './client'
import type {
  Expense,
  ExpenseRequest,
  ExpenseStatistics,
  CategoryStatisticsResponse,
  PaginatedResponse,
  SearchRequest
} from '@/types'

export const expensesApi = {
  /**
   * Get all expenses (uses search endpoint with empty criteria)
   * @returns All expenses sorted by date descending
   */
  async getAll(): Promise<Expense[]> {
    const response = await apiClient.post<PaginatedResponse<Expense>>('/expenses/search', {
      criteria: [],
      page: 0,
      size: 1000,
      sortBy: 'date',
      sortOrder: 'DESC'
    })
    return response.data.content
  },

  // async filter(params: ExpenseFilterParams = {}): Promise<PaginatedResponse<Expense>> {
  //   const searchParams = new URLSearchParams()
  //
  //   if (params.categoryId) searchParams.append('categoryId', params.categoryId.toString())
  //   if (params.startDate) searchParams.append('startDate', params.startDate)
  //   if (params.endDate) searchParams.append('endDate', params.endDate)
  //   if (params.minAmount !== undefined) searchParams.append('minAmount', params.minAmount.toString())
  //   if (params.maxAmount !== undefined) searchParams.append('maxAmount', params.maxAmount.toString())
  //   if (params.page !== undefined) searchParams.append('page', params.page.toString())
  //   if (params.size !== undefined) searchParams.append('size', params.size.toString())
  //
  //   const url = `/expenses/filter${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  //   const response = await apiClient.get<PaginatedResponse<Expense>>(url)
  //   return response.data
  // },

  /**
   * Search expenses using criteria-based filtering (POST endpoint)
   * Supports complex queries with multiple operations
   *
   * @param request - Search request with criteria array
   * @returns Paginated response with matching expenses
   */
  async search(request: SearchRequest): Promise<PaginatedResponse<Expense>> {
    const response = await apiClient.post<PaginatedResponse<Expense>>('/expenses/search', request)
    return response.data
  },

  async getById(id: number): Promise<Expense> {
    const response = await apiClient.get<Expense>(`/expenses/${id}`)
    return response.data
  },

  async create(data: ExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses', data)
    return response.data
  },

  async update(id: number, data: ExpenseRequest): Promise<Expense> {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/expenses/${id}`)
  },

  async getStatistics(): Promise<ExpenseStatistics> {
    const response = await apiClient.get<ExpenseStatistics>('/expenses/statistics')
    return response.data
  },

  async getCategoryStatistics(startDate?: string, endDate?: string): Promise<CategoryStatisticsResponse> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const url = `/expenses/statistics/by-category${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiClient.get<CategoryStatisticsResponse>(url)
    return response.data
  },
}
