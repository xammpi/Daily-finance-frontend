/**
 * Environment Configuration
 * Validates and provides type-safe access to environment variables
 */

interface EnvironmentConfig {
  apiBaseUrl: string
  isDevelopment: boolean
  isProduction: boolean
}

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variable is missing
 */
function validateEnvironment(): void {
  const requiredVars = ['VITE_API_BASE_URL'] as const
  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`

    // In production, throw an error to prevent the app from running with invalid config
    if (import.meta.env.PROD) {
      throw new Error(errorMessage)
    }

    // In development, log a warning but don't crash
    console.warn(`⚠️  ${errorMessage}`)
    console.warn('Please create a .env.local file with the required variables.')
    console.warn('Example: VITE_API_BASE_URL=http://localhost:8080/api/v1')
  }
}

/**
 * Validates the format of the API base URL
 */
function validateApiBaseUrl(url: string): void {
  try {
    new URL(url)
  } catch {
    const errorMessage = `Invalid VITE_API_BASE_URL format: "${url}". Must be a valid URL.`

    if (import.meta.env.PROD) {
      throw new Error(errorMessage)
    }

    console.warn(`⚠️  ${errorMessage}`)
  }

  // Check for common mistakes
  if (url.endsWith('/')) {
    console.warn('⚠️  VITE_API_BASE_URL should not end with a trailing slash')
  }

  if (!url.includes('/api/v1')) {
    console.warn('⚠️  VITE_API_BASE_URL should include "/api/v1" path')
  }
}

/**
 * Creates and validates the environment configuration
 */
function createEnvironmentConfig(): EnvironmentConfig {
  // Validate that all required variables exist
  validateEnvironment()

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

  // Validate the API URL format
  validateApiBaseUrl(apiBaseUrl)

  return {
    apiBaseUrl,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  }
}

/**
 * Validated environment configuration
 * Use this instead of accessing import.meta.env directly
 */
export const env = createEnvironmentConfig()
