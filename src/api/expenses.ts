import apiClient from './client'
import type { Expense, ExpenseRequest } from '@/types'

export const expensesApi = {
  async getAll(): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>('/expenses')
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
}
