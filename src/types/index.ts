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
