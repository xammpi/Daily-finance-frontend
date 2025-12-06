/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns True if valid (min 6 characters), false otherwise
 * @example
 * isValidPassword("secret123") // true
 * isValidPassword("abc") // false
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns True if valid (3-20 alphanumeric characters), false otherwise
 * @example
 * isValidUsername("john_doe") // true
 * isValidUsername("ab") // false
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Validate required field
 * @param value - Value to validate
 * @returns True if not empty, false otherwise
 * @example
 * isRequired("value") // true
 * isRequired("") // false
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

/**
 * Validate date is not in future
 * @param dateString - Date string to validate (YYYY-MM-DD)
 * @returns True if not in future, false otherwise
 * @example
 * isNotFutureDate("2024-12-04") // true or false depending on current date
 */
export function isNotFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date <= today
}

/**
 * Validate numeric value is within range
 * @param value - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if within range, false otherwise
 * @example
 * isInRange(50, 0, 100) // true
 * isInRange(150, 0, 100) // false
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}
