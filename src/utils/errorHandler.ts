/**
 * Centralized error handling utility
 * Provides type-safe error message extraction
 */

import axios, { AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
  error?: string
  details?: string
}

/**
 * Extract user-friendly error message from various error types
 * @param error - Unknown error from catch block
 * @returns User-friendly error message
 */
export function extractErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Network error occurred'
    )
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response || error.code === 'ECONNABORTED'
  }
  return false
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403
  }
  return false
}
