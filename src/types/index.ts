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

// Expense Types
export interface Expense {
  id: number
  amount: number
  date: string                  // ISO date: "2024-12-01"
  description: string
  categoryId: number
  createdAt: string             // ISO datetime (from backend)
  updatedAt: string             // ISO datetime (from backend)
}

export interface ExpenseRequest {
  amount: number
  date: string
  description: string
  categoryId: number
}

// Category Types
export interface Category {
  id: number
  name: string
  description?: string
  createdAt: string             // ISO datetime (from backend)
  updatedAt: string             // ISO datetime (from backend)
}

// Balance Summary (from integration guide)
export interface BalanceSummary {
  currentBalance: number
  todayExpenses: number
  weekExpenses: number
  monthExpenses: number
  currency: Currency
}

// Wallet Transaction Types
export interface DepositRequest {
  amount: number
}

export interface WithdrawRequest {
  amount: number
}

export interface BalanceUpdateRequest {
  amount: number
}

export interface CurrencyUpdateRequest {
  currencyId: number
}

// Statistics Types (NEW)
export interface StatisticsResponse {
  currentBalance: number
  totalDeposits: number
  totalExpenses: number
  totalDepositsThisMonth: number
  totalExpensesThisMonth: number
  currency: Currency
}

export interface CategoryExpenseStatistics {
  categoryId: number
  categoryName: string
  totalAmount: number
  expenseCount: number
}

export interface PeriodStatistics {
  period: 'daily' | 'monthly' | 'yearly'
  currentBalance: number
  totalDeposits: number
  totalExpenses: number
  netChange: number
  depositCount: number
  expenseCount: number
  currency: Currency
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

// Enhanced Statistics (NEW)
export interface EnhancedStatistics {
  allTime: {
    totalDeposits: number
    totalExpenses: number
    netTotal: number
  }
  averages: {
    dailySpending: number
    weeklySpending: number
    monthlySpending: number
  }
  currentPeriod: PeriodStatistics
  previousPeriod: PeriodStatistics
  percentageChange: {
    deposits: number
    expenses: number
    netChange: number
  }
  currency: Currency
}

// Category Statistics with Time Period
export interface CategoryPeriodStatistics extends CategoryExpenseStatistics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time'
  averagePerTransaction: number
  percentageOfTotal: number
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

// Balance Change Warning
export interface BalanceWarning {
  type: 'low' | 'negative' | 'critical'
  message: string
  currentBalance: number
  threshold: number
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

// Filter Request Parameters (GET-based filtering)
export interface ExpenseFilterParams {
  categoryId?: number
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  size?: number
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

// Supported Currencies (can be hardcoded or fetched)
export const SUPPORTED_CURRENCIES: Omit<Currency, 'createdAt' | 'updatedAt'>[] = [
  { id: 1, code: 'USD', name: 'US Dollar', symbol: '$' },
  { id: 2, code: 'EUR', name: 'Euro', symbol: '€' },
  { id: 3, code: 'GBP', name: 'British Pound', symbol: '£' },
  { id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { id: 5, code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { id: 6, code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { id: 7, code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { id: 8, code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { id: 9, code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { id: 10, code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { id: 11, code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { id: 12, code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { id: 13, code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { id: 14, code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { id: 15, code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { id: 16, code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { id: 17, code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { id: 18, code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { id: 19, code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { id: 20, code: 'ZAR', name: 'South African Rand', symbol: 'R' },
]
