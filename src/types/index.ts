export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  balance: number
  currency: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  username: string
}

export interface Expense {
  id: number
  amount: number
  date: string
  description: string
  categoryId: number
  categoryName: string
}

export interface ExpenseRequest {
  amount: number
  date: string
  description: string
  categoryId: number
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface BalanceSummary {
  currentBalance: number
  totalExpensesThisMonth: number
  remainingBalance: number
  currency: string
}

export interface DepositRequest {
  amount: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
