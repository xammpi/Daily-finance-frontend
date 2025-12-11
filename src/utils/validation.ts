/**
 * Input validation utilities
 * Provides sanitization and validation functions for user input
 */

import { MAX_AMOUNT_VALUE, MIN_AMOUNT_VALUE } from '@/constants'

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeString(input: string): string {
  if (!input) return ''

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Remove script and other dangerous content
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Trim whitespace
  return sanitized.trim()
}

/**
 * Validate and sanitize amount input
 * @param amount - The amount to validate
 * @returns Error message if invalid, null if valid
 */
export function validateAmount(amount: number | string): string | null {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return 'Amount must be a valid number'
  }

  if (numAmount < MIN_AMOUNT_VALUE) {
    return `Amount must be at least ${MIN_AMOUNT_VALUE}`
  }

  if (numAmount > MAX_AMOUNT_VALUE) {
    return `Amount cannot exceed ${MAX_AMOUNT_VALUE.toLocaleString()}`
  }

  return null
}

/**
 * Validate description length and content
 */
export function validateDescription(description: string, maxLength: number = 255): string | null {
  const sanitized = sanitizeString(description)

  if (sanitized.length === 0) {
    return 'Description is required'
  }

  if (sanitized.length > maxLength) {
    return `Description must be ${maxLength} characters or less`
  }

  return null
}

/**
 * Validate category name
 */
export function validateCategoryName(name: string): string | null {
  const sanitized = sanitizeString(name)

  if (sanitized.length === 0) {
    return 'Category name is required'
  }

  if (sanitized.length < 2) {
    return 'Category name must be at least 2 characters'
  }

  if (sanitized.length > 50) {
    return 'Category name must be 50 characters or less'
  }

  return null
}
