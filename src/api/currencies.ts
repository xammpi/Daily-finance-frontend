import apiClient from './client'
import type { Currency } from '@/types'

/**
 * Currencies API
 * Public endpoints - no authentication required
 */
export const currenciesApi = {
  /**
   * Get all available currencies
   * @returns Promise<Currency[]>
   */
  getAll: async (): Promise<Currency[]> => {
    const response = await apiClient.get<Currency[]>('/currencies')
    return response.data
  }
}
