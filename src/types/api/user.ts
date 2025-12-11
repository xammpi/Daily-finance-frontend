/**
 * User API types
 * Request and response types for user-related endpoints
 */

/**
 * Currency update request payload
 * @endpoint PUT /api/v1/user/currency
 */
export interface CurrencyUpdateRequest {
  readonly currencyId: number
}

/**
 * Profile update request payload
 * @endpoint PUT /api/v1/user/profile
 */
export interface UpdateProfileRequest {
  readonly firstName: string
  readonly lastName: string
  readonly email: string
}

/**
 * Password change request payload
 * @endpoint PUT /api/v1/user/password
 */
export interface ChangePasswordRequest {
  readonly currentPassword: string
  readonly newPassword: string
}
