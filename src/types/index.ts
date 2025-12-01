export interface User {
  id: number
  username: string
  email: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  username: string
}

export interface Transaction {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  description: string
  notes?: string
  categoryId: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
  userId: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
