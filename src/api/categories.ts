import apiClient from './client'
import type { Category } from '@/types'

export interface CreateCategoryRequest {
  name: string
  description?: string
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories')
    return response.data
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`)
    return response.data
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', data)
    return response.data
  },

  update: async (id: number, data: Partial<CreateCategoryRequest>): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
