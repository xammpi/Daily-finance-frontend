import { create } from 'zustand'
import { currenciesApi } from '@/api/currencies'
import type { Currency } from '@/types'

interface CurrencyStore {
  currencies: Currency[]
  isLoading: boolean
  error: string | null
  fetchCurrencies: () => Promise<void>
  getCurrencyById: (id: number) => Currency | undefined
  getCurrencyByCode: (code: string) => Currency | undefined
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currencies: [],
  isLoading: false,
  error: null,

  fetchCurrencies: async () => {
    // Don't fetch if already loaded
    if (get().currencies.length > 0) return

    set({ isLoading: true, error: null })
    try {
      const currencies = await currenciesApi.getAll()
      set({ currencies, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load currencies',
        isLoading: false,
      })
    }
  },

  getCurrencyById: (id: number) => {
    return get().currencies.find(c => c.id === id)
  },

  getCurrencyByCode: (code: string) => {
    return get().currencies.find(c => c.code === code)
  },
}))
