import { create } from 'zustand'
import { authApi } from '@/api/auth'
import type { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.login(data)
      localStorage.setItem('accessToken', response.accessToken)
      const user: User = {
        id: response.userId,
        username: response.username,
        email: '', // Email not returned in auth response
      }
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
      localStorage.setItem('accessToken', response.accessToken)
      const user: User = {
        id: response.userId,
        username: response.username,
        email: data.email, // Use email from registration form
      }
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
    localStorage.removeItem('accessToken')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  clearError: () => set({ error: null }),

  checkAuth: () => {
    const token = localStorage.getItem('accessToken')
    set({
      token,
      isAuthenticated: !!token,
    })
  },
}))
