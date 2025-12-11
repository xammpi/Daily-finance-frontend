/**
 * Category entity types
 */

/**
 * Category type enum
 * Represents whether a category is for income or expenses
 */
export enum CategoryType {
  // eslint-disable-next-line no-unused-vars
  INCOME = 'INCOME',
  // eslint-disable-next-line no-unused-vars
  EXPENSE = 'EXPENSE'
}

/**
 * Category entity
 * User-defined categories for organizing transactions
 */
export interface Category {
  readonly id: number
  readonly name: string
  readonly description?: string
  readonly type: CategoryType
  readonly createdAt: string
  readonly updatedAt: string
}
