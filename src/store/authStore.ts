import { create } from 'zustand'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import type { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (_data: LoginRequest) => Promise<void>
  register: (_data: RegisterRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: sessionStorage.getItem('accessToken'),
  isAuthenticated: !!sessionStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.login(data)
      sessionStorage.setItem('accessToken', response.accessToken)

      // Fetch full user profile (includes wallet with currency)
      const user = await userApi.getProfile()

      set({
        user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.register(data)
      sessionStorage.setItem('accessToken', response.accessToken)

      // Fetch full user profile (includes wallet with selected currency)
      const user = await userApi.getProfile()

      set({
        user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  logout: () => {
    sessionStorage.removeItem('accessToken')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  clearError: () => set({ error: null }),

  checkAuth: () => {
    const token = sessionStorage.getItem('accessToken')
    set({
      token,
      isAuthenticated: !!token,
    })
  },
}))
