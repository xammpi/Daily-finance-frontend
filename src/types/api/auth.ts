/**
 * Authentication API types
 * Request and response types for authentication endpoints
 */

/**
 * Login request payload
 * @endpoint POST /api/v1/auth/login
 */
export interface LoginRequest {
  readonly username: string
  readonly password: string
}

/**
 * Registration request payload
 * @endpoint POST /api/v1/auth/register
 */
export interface RegisterRequest {
  readonly email: string
  readonly username: string
  readonly password: string
  readonly firstName: string
  readonly lastName: string
  readonly currencyId: number
}

/**
 * Authentication response
 * Returned after successful login or registration
 */
export interface AuthResponse {
  readonly accessToken: string
  readonly refreshToken: string
  readonly tokenType: string
  readonly userId: number
  readonly username: string
}
