import apiClient from './client'
import type { SearchRequest, PaginatedResponse } from '@/types'
import { Category, CategoryRequest } from '@/types'

export const categoriesApi = {
  /**
   * Get all categories (uses search endpoint with empty criteria)
   * @returns All categories sorted by name
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.post<PaginatedResponse<Category>>('/categories/search', {
      criteria: [],
      page: 0,
      size: 100,
      sortBy: 'name',
      sortOrder: 'ASC'
    })
    return response.data.content
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`)
    return response.data
  },

  /**
   * Search categories using criteria-based filtering (POST endpoint)
   * Supports complex queries with multiple operations
   *
   * @param request - Search request with criteria array
   * @returns Paginated response with matching categories
   */
  search: async (request: SearchRequest): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.post<PaginatedResponse<Category>>('/categories/search', request)
    return response.data
  },

  create: async (data: CategoryRequest): Promise<CategoryRequest> => {
    const response = await apiClient.post<CategoryRequest>('/categories', data)
    return response.data
  },

  update: async (id: number, data: Partial<CategoryRequest>): Promise<CategoryRequest> => {
    const response = await apiClient.put<CategoryRequest>(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
