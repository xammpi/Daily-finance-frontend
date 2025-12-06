/**
 * Centralized exports for all utility functions
 * Based on FRONTEND_INTEGRATION_GUIDE.md best practices
 */

// Date utilities
export {
  formatDateForAPI,
  getCurrentMonthRange,
  getCurrentWeekRange,
  getTodayDate,
  formatDateForDisplay,
  formatDateShort,
} from './dateUtils'

// Amount utilities
export {
  formatAmount,
  formatCurrency,
  parseAmount,
  isValidAmount,
  isSufficientBalance,
  roundAmount,
} from './amountUtils'

// Function utilities
export { debounce, throttle, sleep, retry } from './functionUtils'

// Validation utilities
export {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  isRequired,
  isNotFutureDate,
  isInRange,
} from './validationUtils'

// API Helper utilities
export {
  apiRequest,
  isAuthenticated,
  saveAuthTokens,
  logout,
  getCurrentUserId,
} from './apiHelper'

// Balance Manager
export { BalanceManager, balanceManager } from './BalanceManager'
