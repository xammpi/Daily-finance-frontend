// Currency Entity
export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
}

// User Profile (from /api/v1/user/profile)
export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  currencyId: number
}

// Wallet Details (from /api/v1/user/wallet)
export interface Wallet {
  id: number
  amount: number
  currency: Currency
  totalDeposits: number        // Number of deposit transactions
  totalDepositAmount: number   // Total amount deposited
  totalExpenses: number         // Number of expense transactions
  totalExpenseAmount: number    // Total amount spent
  lastTransactionDate?: string  // ISO datetime
  lowBalanceWarning: boolean    // true if balance < 100
}

// Auth Types
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
  currencyId: number // NEW: required field
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  username: string
}

// Wallet Transaction Types
export interface DepositRequest {
  amount: number
}

export interface BalanceUpdateRequest {
  amount: number
}

export interface CurrencyUpdateRequest {
  currencyId: number
}

export interface CategoryExpenseStatistics {
  categoryId: number
  categoryName: string
  totalAmount: number
  expenseCount: number
}

// Expense Statistics (from integration guide)
export interface ExpenseStatistics {
  todayExpenses: number
  weekExpenses: number // Monday-Sunday
  monthExpenses: number
  totalExpenses: number // All time
  averageDailyExpenses: number
  averageWeeklyExpenses: number
  averageMonthlyExpenses: number
  previousWeekExpenses: number // For comparison
  previousMonthExpenses: number // For comparison
  currency: Currency
}

// Category Statistics Breakdown Item
export interface CategoryStatisticsItem {
  categoryId: number
  categoryName: string
  totalAmount: number
  expenseCount: number
  percentage: number
}

// Category Statistics Response (from integration guide)
export interface CategoryStatisticsResponse {
  startDate: string
  endDate: string
  totalExpenses: number
  categoryBreakdown: CategoryStatisticsItem[]
  currency: Currency
}

// Wallet Types (NEW)
export interface WalletDetails extends Wallet {
  user: {
    id: number
    username: string
    email: string
  }
  lastDepositDate?: string
  lastWithdrawDate?: string
  transactionCount: number
}

export interface WithdrawRequest {
  amount: number
  description?: string
}

// Pagination (from FILTERING_PAGINATION_GUIDE.md)
export interface PaginatedResponse<T> {
  content: T[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================
// Search Criteria Types (POST-based search)
// ============================================

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
 */
export interface SearchCriteria {
  /**
   * Field name to search on
   * Can be nested with dot notation (e.g., 'category.name')
   */
  field: string

  /**
   * Operation to apply
   */
  operation: SearchOperation

  /**
   * Value to compare against
   * For BETWEEN operation, this is the lower bound
   * For IN/NOT_IN operations, use comma-separated values
   */
  value: string | number | boolean

  /**
   * Upper bound value for BETWEEN operation
   * Required only when operation is BETWEEN
   */
  valueTo?: string | number
}

/**
 * Search request payload
 * Combines multiple criteria with AND logic
 */
export interface SearchRequest {
  /**
   * Array of search criteria (combined with AND)
   */
  criteria: SearchCriteria[]

  /**
   * Page number (0-indexed)
   */
  page?: number

  /**
   * Page size (number of items per page)
   */
  size?: number

  /**
   * Field to sort by
   */
  sortBy?: string

  /**
   * Sort order
   */
  sortOrder?: 'ASC' | 'DESC'
}

/**
 * Transaction Search Summary
 * Aggregated information for search results
 */
export interface TransactionSearchSummary {
  totalAmount: number
  transactionCount: number
  totalExpenseAmount: number
  totalIncomeAmount: number
}

/**
 * Transaction Search Response
 * Includes both paginated transactions and summary
 */
export interface TransactionSearchResponse<T> {
  transactions: PaginatedResponse<T>
  summary: TransactionSearchSummary
}
