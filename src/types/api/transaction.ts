/**
 * Transaction API types
 * Request and response types for transaction endpoints
 */

/**
 * Transaction creation/update request payload
 * @endpoint POST /api/v1/transactions
 * @endpoint PUT /api/v1/transactions/{id}
 */
export interface TransactionRequest {
  readonly amount: number
  readonly date: string
  readonly description: string
  readonly categoryId: number
}
