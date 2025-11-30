export interface User {
  id: number
  email: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Transaction {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  description: string
  accountId: number
  categoryId: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  type: 'INCOME' | 'EXPENSE'
  parentId?: number
  userId: number
}

export interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  userId: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
