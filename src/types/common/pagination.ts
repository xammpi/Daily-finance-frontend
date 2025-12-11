/**
 * Pagination types
 * Generic pagination wrapper for API responses
 */

/**
 * Paginated response wrapper
 * Generic wrapper for paginated API responses
 *
 * @template T - The type of items in the content array
 *
 * @example
 * ```typescript
 * const response: PaginatedResponse<Transaction> = await api.getTransactions()
 * ```
 */
export interface PaginatedResponse<T> {
  readonly content: T[]
  readonly currentPage: number
  readonly pageSize: number
  readonly totalElements: number
  readonly totalPages: number
  readonly first: boolean
  readonly last: boolean
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}
