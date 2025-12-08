export interface Category {
  id: number
  name: string
  description?: string
  type: CategoryType
  createdAt: string
  updatedAt: string
}

export interface CategoryRequest {
  name: string
  description?: string
  type: CategoryType
}

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}