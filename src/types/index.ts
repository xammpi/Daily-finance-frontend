/**
 * Main types barrel export
 * Re-exports all types from subdirectories for convenient importing
 *
 * Usage:
 * ```typescript
 * import { User, Transaction, LoginRequest, PaginatedResponse } from '@/types'
 * ```
 *
 * Or import from specific modules:
 * ```typescript
 * import { User } from '@/types/entities'
 * import { LoginRequest } from '@/types/api'
 * ```
 */

// Entity types
export * from './entities'

// API types
export * from './api'

// Common types
export * from './common'
