// Currency Entity (new in backend v1.1.0)
export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  createdAt: string
  updatedAt: string
}

// Wallet Entity
export interface Wallet {
  id: number
  amount: number
  currency: Currency
  createdAt: string
  updatedAt: string
}

// User Entity (updated with wallet)
export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  wallet: Wallet
  createdAt: string
  updatedAt: string
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

// Category Types
export interface Category {
  id: number
  name: string
  description?: string
}

// Balance Summary (updated with currency object)
export interface BalanceSummary {
  currentBalance: number
  totalExpensesThisMonth: number
  remainingBalance: number
  currency: Currency
}

// Deposit Types
export interface DepositRequest {
  amount: number
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

// Pagination
export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
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
