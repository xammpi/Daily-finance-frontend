/**
 * API Helper utilities from FRONTEND_INTEGRATION_GUIDE.md
 * Centralized error handling and request management
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>
}

/**
 * Centralized API request helper with error handling
 * Handles authentication, errors, and common response scenarios
 * From FRONTEND_INTEGRATION_GUIDE.md Error Handling section
 *
 * @param url - API endpoint URL (relative to BASE_URL)
 * @param options - Fetch options
 * @returns Parsed response or null for 204
 * @throws Error with user-friendly message
 *
 * @example
 * const wallet = await apiRequest('/user/wallet')
 * const expense = await apiRequest('/expenses', { method: 'POST', body: JSON.stringify(data) })
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T | null> {
  const token = localStorage.getItem('accessToken')

  const defaultOptions: ApiRequestOptions = {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  }

  const mergedOptions: ApiRequestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
    const response = await fetch(fullUrl, mergedOptions)

    // Handle 401 - Session expired, redirect to login
    if (response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }

    // Handle other errors
    if (!response.ok) {
      let errorMessage = 'Request failed'
      try {
        const error = await response.json()
        errorMessage = error.message || error.error || errorMessage
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null
    }

    // Parse and return JSON response
    return await response.json()
  } catch (error) {
    // Log error for debugging
    console.error('API Request failed:', {
      url,
      options,
      error,
    })

    // Re-throw with original message
    throw error
  }
}

/**
 * Check if user is authenticated
 * @returns True if user has valid token
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken')
}

/**
 * Save authentication tokens
 * @param authResponse - Response from login/register
 */
export function saveAuthTokens(authResponse: {
  accessToken: string
  refreshToken: string
  userId: number
}): void {
  localStorage.setItem('accessToken', authResponse.accessToken)
  localStorage.setItem('refreshToken', authResponse.refreshToken)
  localStorage.setItem('userId', authResponse.userId.toString())
}

/**
 * Clear authentication tokens and redirect to login
 */
export function logout(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userId')
  window.location.href = '/login'
}

/**
 * Get current user ID from storage
 * @returns User ID or null
 */
export function getCurrentUserId(): number | null {
  const userId = localStorage.getItem('userId')
  return userId ? parseInt(userId, 10) : null
}
