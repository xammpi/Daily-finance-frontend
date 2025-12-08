export interface Transaction {
  id: number
  amount: number
  date: string // ISO date: "2024-12-01"
  description: string
  categoryId: number
  categoryName: string
  createdAt: string
  updatedAt: string
}

export interface TransactionRequest {
  amount: number
  date: string
  description: string
  categoryId: number
}