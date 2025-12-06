/**
 * CriteriaBuilder Utility
 *
 * A fluent API for building SearchCriteria arrays in a type-safe and readable way.
 * Makes it easier to construct complex search queries without manually creating criteria objects.
 *
 * @example
 * ```typescript
 * const criteria = new CriteriaBuilder()
 *   .equals('categoryId', 5)
 *   .between('amount', 100, 500)
 *   .like('description', 'grocery')
 *   .build()
 *
 * const result = await expensesApi.search({ criteria })
 * ```
 */

import type { SearchCriteria, SearchOperation, SearchRequest } from '@/types'

export class CriteriaBuilder {
  private criteria: SearchCriteria[] = []

  /**
   * Add a custom criterion
   */
  add(field: string, operation: SearchOperation, value: string | number | boolean, valueTo?: string | number): this {
    this.criteria.push({
      field,
      operation,
      value,
      valueTo
    })
    return this
  }

  // ==========================================
  // Equality Operations
  // ==========================================

  /**
   * Add EQUALS criterion (field = value)
   */
  equals(field: string, value: string | number | boolean): this {
    return this.add(field, 'EQUALS', value)
  }

  /**
   * Add NOT_EQUALS criterion (field != value)
   */
  notEquals(field: string, value: string | number | boolean): this {
    return this.add(field, 'NOT_EQUALS', value)
  }

  // ==========================================
  // Comparison Operations
  // ==========================================

  /**
   * Add GREATER_THAN criterion (field > value)
   */
  greaterThan(field: string, value: number): this {
    return this.add(field, 'GREATER_THAN', value)
  }

  /**
   * Add GREATER_THAN_OR_EQUAL criterion (field >= value)
   */
  greaterThanOrEqual(field: string, value: number): this {
    return this.add(field, 'GREATER_THAN_OR_EQUAL', value)
  }

  /**
   * Add LESS_THAN criterion (field < value)
   */
  lessThan(field: string, value: number): this {
    return this.add(field, 'LESS_THAN', value)
  }

  /**
   * Add LESS_THAN_OR_EQUAL criterion (field <= value)
   */
  lessThanOrEqual(field: string, value: number): this {
    return this.add(field, 'LESS_THAN_OR_EQUAL', value)
  }

  /**
   * Add BETWEEN criterion (field BETWEEN value AND valueTo)
   */
  between(field: string, value: number | string, valueTo: number | string): this {
    return this.add(field, 'BETWEEN', value, valueTo)
  }

  // ==========================================
  // String Operations
  // ==========================================

  /**
   * Add LIKE criterion (field LIKE %value%)
   * Matches anywhere in the string
   */
  like(field: string, value: string): this {
    return this.add(field, 'LIKE', value)
  }

  /**
   * Add STARTS_WITH criterion (field LIKE value%)
   */
  startsWith(field: string, value: string): this {
    return this.add(field, 'STARTS_WITH', value)
  }

  /**
   * Add ENDS_WITH criterion (field LIKE %value)
   */
  endsWith(field: string, value: string): this {
    return this.add(field, 'ENDS_WITH', value)
  }

  // ==========================================
  // Collection Operations
  // ==========================================

  /**
   * Add IN criterion (field IN (value1, value2, ...))
   * @param values - Array of values or comma-separated string
   */
  in(field: string, values: (string | number)[] | string): this {
    const value = Array.isArray(values) ? values.join(',') : values
    return this.add(field, 'IN', value)
  }

  /**
   * Add NOT_IN criterion (field NOT IN (value1, value2, ...))
   * @param values - Array of values or comma-separated string
   */
  notIn(field: string, values: (string | number)[] | string): this {
    const value = Array.isArray(values) ? values.join(',') : values
    return this.add(field, 'NOT_IN', value)
  }

  // ==========================================
  // Null Operations
  // ==========================================

  /**
   * Add IS_NULL criterion (field IS NULL)
   */
  isNull(field: string): this {
    return this.add(field, 'IS_NULL', '')
  }

  /**
   * Add IS_NOT_NULL criterion (field IS NOT NULL)
   */
  isNotNull(field: string): this {
    return this.add(field, 'IS_NOT_NULL', '')
  }

  // ==========================================
  // Date Helper Methods
  // ==========================================

  /**
   * Add date range criterion (BETWEEN dates)
   */
  dateRange(field: string, startDate: string, endDate: string): this {
    return this.between(field, startDate, endDate)
  }

  /**
   * Add date equals criterion
   */
  dateEquals(field: string, date: string): this {
    return this.equals(field, date)
  }

  /**
   * Add date after criterion (date > value)
   */
  dateAfter(field: string, date: string): this {
    return this.greaterThan(field, date as any)
  }

  /**
   * Add date before criterion (date < value)
   */
  dateBefore(field: string, date: string): this {
    return this.lessThan(field, date as any)
  }

  // ==========================================
  // Amount Helper Methods
  // ==========================================

  /**
   * Add amount range criterion (BETWEEN amounts)
   */
  amountRange(field: string, minAmount: number, maxAmount: number): this {
    return this.between(field, minAmount, maxAmount)
  }

  /**
   * Add minimum amount criterion (amount >= value)
   */
  minAmount(field: string, amount: number): this {
    return this.greaterThanOrEqual(field, amount)
  }

  /**
   * Add maximum amount criterion (amount <= value)
   */
  maxAmount(field: string, amount: number): this {
    return this.lessThanOrEqual(field, amount)
  }

  // ==========================================
  // Nested Field Helpers
  // ==========================================

  /**
   * Search by category name using nested field
   */
  categoryName(value: string): this {
    return this.like('category.name', value)
  }

  /**
   * Search by category ID
   */
  categoryId(id: number): this {
    return this.equals('categoryId', id)
  }

  // ==========================================
  // Build Methods
  // ==========================================

  /**
   * Get the built criteria array
   */
  build(): SearchCriteria[] {
    return [...this.criteria]
  }

  /**
   * Build a complete SearchRequest with pagination and sorting
   */
  buildRequest(options?: {
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }): SearchRequest {
    return {
      criteria: this.build(),
      page: options?.page ?? 0,
      size: options?.size ?? 10,
      sortBy: options?.sortBy,
      sortOrder: options?.sortOrder ?? 'DESC'
    }
  }

  /**
   * Clear all criteria
   */
  clear(): this {
    this.criteria = []
    return this
  }

  /**
   * Get the number of criteria
   */
  count(): number {
    return this.criteria.length
  }

  /**
   * Check if there are any criteria
   */
  isEmpty(): boolean {
    return this.criteria.length === 0
  }

  /**
   * Remove the last criterion
   */
  removeLast(): this {
    this.criteria.pop()
    return this
  }
}

// ==========================================
// Static Factory Methods
// ==========================================

/**
 * Create a new CriteriaBuilder instance
 */
export function createCriteria(): CriteriaBuilder {
  return new CriteriaBuilder()
}

/**
 * Create criteria from an object (useful for converting filter params)
 */
export function criteriaFromObject(filters: Record<string, any>): SearchCriteria[] {
  const builder = new CriteriaBuilder()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle common patterns
      if (key === 'categoryId' && typeof value === 'number') {
        builder.categoryId(value)
      } else if (key === 'startDate' && filters.endDate) {
        builder.dateRange('date', value, filters.endDate)
      } else if (key === 'minAmount' && filters.maxAmount) {
        builder.amountRange('amount', value, filters.maxAmount)
      } else if (key === 'minAmount') {
        builder.minAmount('amount', value)
      } else if (key === 'maxAmount') {
        builder.maxAmount('amount', value)
      } else if (typeof value === 'string') {
        builder.like(key, value)
      } else if (typeof value === 'number') {
        builder.equals(key, value)
      } else if (typeof value === 'boolean') {
        builder.equals(key, value)
      }
    }
  })

  return builder.build()
}
