/**
 * Search and filtering types
 * Types for advanced search functionality with criteria-based filtering
 */

/**
 * Search operation types for criteria-based filtering
 * Supports complex queries with various comparison operations
 */
export type SearchOperation =
  | 'EQUALS'              // Exact match: field = value
  | 'NOT_EQUALS'          // Not equal: field != value
  | 'GREATER_THAN'        // Greater than: field > value
  | 'GREATER_THAN_OR_EQUAL' // Greater or equal: field >= value
  | 'LESS_THAN'           // Less than: field < value
  | 'LESS_THAN_OR_EQUAL'  // Less or equal: field <= value
  | 'LIKE'                // Contains: field LIKE %value%
  | 'STARTS_WITH'         // Starts with: field LIKE value%
  | 'ENDS_WITH'           // Ends with: field LIKE %value
  | 'IN'                  // In list: field IN (value1, value2, ...)
  | 'NOT_IN'              // Not in list: field NOT IN (value1, value2, ...)
  | 'IS_NULL'             // Is null: field IS NULL
  | 'IS_NOT_NULL'         // Is not null: field IS NOT NULL
  | 'BETWEEN'             // Between: field BETWEEN value AND valueTo

/**
 * Single search criterion
 * Represents one condition in a search query
 *
 * @example
 * ```typescript
 * const criteria: SearchCriteria = {
 *   field: 'amount',
 *   operation: 'GREATER_THAN',
 *   value: 100
 * }
 * ```
 */
export interface SearchCriteria {
  /**
   * Field name to search on
   * Can be nested with dot notation (e.g., 'category.name')
   */
  readonly field: string

  /**
   * Operation to apply
   */
  readonly operation: SearchOperation

  /**
   * Value to compare against
   * For BETWEEN operation, this is the lower bound
   * For IN/NOT_IN operations, use comma-separated values
   */
  readonly value: string | number | boolean

  /**
   * Upper bound value for BETWEEN operation
   * Required only when operation is BETWEEN
   */
  readonly valueTo?: string | number
}

/**
 * Search request payload
 * Combines multiple criteria with AND logic
 *
 * @example
 * ```typescript
 * const request: SearchRequest = {
 *   criteria: [
 *     { field: 'amount', operation: 'GREATER_THAN', value: 100 },
 *     { field: 'date', operation: 'BETWEEN', value: '2024-01-01', valueTo: '2024-12-31' }
 *   ],
 *   page: 0,
 *   size: 20,
 *   sortBy: 'date',
 *   sortOrder: 'DESC'
 * }
 * ```
 */
export interface SearchRequest {
  /**
   * Array of search criteria (combined with AND)
   */
  readonly criteria: SearchCriteria[]

  /**
   * Page number (0-indexed)
   */
  readonly page?: number

  /**
   * Page size (number of items per page)
   */
  readonly size?: number

  /**
   * Field to sort by
   */
  readonly sortBy?: string

  /**
   * Sort order
   */
  readonly sortOrder?: 'ASC' | 'DESC'
}
